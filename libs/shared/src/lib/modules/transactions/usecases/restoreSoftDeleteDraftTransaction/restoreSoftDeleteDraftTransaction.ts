/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Either, left, right } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

// * Authorization Logic
import { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

//* Repo Imports
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { TransactionRepoContract } from '../../repos/transactionRepo';
import { ArticleRepoContract as ManuscriptRepoContract } from '../../../manuscripts/repos/articleRepo';

//* Usecase Imports
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails';
import { GetItemsForInvoiceUsecase } from '../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetManuscriptByManuscriptIdUsecase } from '../../../manuscripts/usecases/getManuscriptByManuscriptId';
import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../invoices/usecases/getInvoiceIdByManuscriptCustomId';
import { GetTransactionDetailsByManuscriptCustomIdUsecase } from '../../usecases/getTransactionDetailsByManuscriptCustomId';

import * as Errors from './restoreSoftDeleteDraftTransaction.errors';
import type { RestoreSoftDeleteDraftTransactionRequestDTO as DTO } from './restoreSoftDeleteDraftTransaction.dto';
import { RestoreSoftDeleteDraftTransactionResponse as Response } from './restoreSoftDeleteDraftTransaction.response';

type Context = UsecaseAuthorizationContext;
export class RestoreSoftDeleteDraftTransactionUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private transactionRepo: TransactionRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ManuscriptRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:restore')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const maybeValidRequest = this.verifyData(request);
    if (maybeValidRequest.isLeft()) {
      return maybeValidRequest;
    }
    // * build the ManuscriptId
    const manuscriptId = request.manuscriptId;

    const getInvoice = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const getTransaction = new GetTransactionDetailsByManuscriptCustomIdUsecase(
      this.invoiceItemRepo,
      this.transactionRepo,
      this.manuscriptRepo,
      this.invoiceRepo
    );
    const getInvoiceId = new GetInvoiceIdByManuscriptCustomIdUsecase(
      this.manuscriptRepo,
      this.invoiceItemRepo
    );
    const getInvoiceItems = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );
    const getManuscript = new GetManuscriptByManuscriptIdUsecase(
      this.manuscriptRepo
    );

    try {
      // * System identifies article by manuscript Id
      const maybeManuscript = await getManuscript.execute(
        { manuscriptId },
        context
      );

      if (!maybeManuscript || maybeManuscript.isLeft()) {
        throw new Errors.ManuscriptNotFoundError(request.manuscriptId);
      }
      const manuscript = maybeManuscript.value.getValue();

      // * System obtains invoiceId by manuscript custom Id
      const customId = manuscript.customId;
      const maybeInvoiceId = await getInvoiceId.execute({ customId }, context);
      if (!maybeInvoiceId || maybeInvoiceId.isLeft()) {
        throw new Errors.InvoiceIdNotFoundError(customId);
      }

      const invoiceId = maybeInvoiceId.value.getValue().toString();

      // * System identifies invoice by invoice Id
      const maybeInvoice = await getInvoice.execute({ invoiceId }, context);
      if (!maybeInvoice || maybeInvoice.isLeft()) {
        throw new Errors.InvoiceNotFoundError(invoiceId);
      }

      const invoice = maybeInvoice.value.getValue();

      // * System identifies invoice item by invoice Id
      const maybeInvoiceItems = await getInvoiceItems.execute(
        { invoiceId },
        context
      );
      if (!maybeInvoiceItems || maybeInvoiceItems.isLeft()) {
        throw new Errors.InvoiceItemNotFoundError(invoiceId);
      }
      const invoiceItem = maybeInvoiceItems.value.getValue()[0];

      // * System identifies transaction by manuscript custom Id
      const maybeTransaction = await getTransaction.execute(
        { customId },
        context
      );
      if (!maybeTransaction || maybeTransaction.isLeft()) {
        throw new Errors.TransactionNotFoundError(manuscriptId);
      }
      const transaction = maybeTransaction.value.getValue();
      // This is where all the magic happens!
      // * System restores transaction
      try {
        await this.transactionRepo.restore(transaction);
      } catch (err) {
        return left(new Errors.TransactionRestoreError(err));
      }
      // * System restores invoice
      try {
        await this.invoiceRepo.restore(invoice);
      } catch (err) {
        return left(new Errors.InvoiceRestoreError(err));
      }
      // * System restores invoice item
      try {
        await this.invoiceItemRepo.restore(invoiceItem);
      } catch (err) {
        return left(new Errors.InvoiceItemRestoreError(err));
      }
      // * System restores manuscript
      try {
        await this.manuscriptRepo.restore(manuscript);
      } catch (err) {
        return left(new Errors.ManuscriptRestoreError(err));
      }

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private verifyData(
    request: DTO
  ): Either<Errors.ManuscriptRequiredError, void> {
    if (!request.manuscriptId) {
      return left(new Errors.ManuscriptRequiredError());
    }
    return right(null);
  }
}
