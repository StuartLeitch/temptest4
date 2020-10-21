/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Either, Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Invoice } from '../../../invoices/domain/Invoice';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
import { Transaction } from '../../domain/Transaction';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';

// * Authorization Logic
import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

//* Repo Imports
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { TransactionRepoContract } from '../../repos/transactionRepo';
import { ArticleRepoContract as ManuscriptRepoContract } from '../../../manuscripts/repos/articleRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

//* Usecase Imports
import type { RestoreSoftDeleteDraftTransactionRequestDTO as DTO } from './restoreSoftDeleteDraftTransaction.dto';
import * as Errors from './restoreSoftDeleteDraftTransaction.errors';
import { RestoreSoftDeleteDraftTransactionResponse as Response } from './restoreSoftDeleteDraftTransaction.response';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails';
import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../invoices/usecases/getInvoiceIdByManuscriptCustomId';
import { GetItemsForInvoiceUsecase } from '../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetManuscriptByManuscriptIdUsecase } from '../../../manuscripts/usecases/getManuscriptByManuscriptId';
import { GetTransactionDetailsByManuscriptCustomIdUsecase } from '../../usecases/getTransactionDetailsByManuscriptCustomId';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

export class RestoreSoftDeleteDraftTransactionUsecase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private transactionRepo: TransactionRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private manuscriptRepo: ManuscriptRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:restore')
  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    let invoiceItem: InvoiceItem;
    let invoice: Invoice;
    let transaction: Transaction;
    let manuscript: Manuscript;

    const maybeValidRequest = this.verifyData(request);
    if (maybeValidRequest.isLeft()) {
      return maybeValidRequest;
    }
    // * build the ManuscriptId
    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    )
      .getValue()
      .toString();

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
    const customId = manuscript.customId;

    try {
      // * System obtains invoiceId by manuscript custom Id
      const maybeInvoiceId = await getInvoiceId.execute(
        { customId },
        defaultContext
      );
      if (!maybeInvoiceId || maybeInvoiceId.isLeft()) {
        throw new Errors.InvoiceIdNotFoundError(customId);
      }

      const invoiceId = maybeInvoiceId.value.getValue().toString();

      // * System identifies article by manuscript Id
      const maybeManuscript = await getManuscript.execute(
        { manuscriptId },
        defaultContext
      );

      if (!maybeManuscript || maybeManuscript.isLeft()) {
        throw new Errors.ManuscriptNotFoundError(request.manuscriptId);
      }
      const manuscript = maybeManuscript.value.getValue();

      // * System identifies invoice by invoice Id
      const maybeInvoice = await getInvoice.execute(
        { invoiceId },
        defaultContext
      );
      if (!maybeInvoice || maybeInvoice.isLeft()) {
        throw new Errors.InvoiceNotFoundError(invoiceId);
      }

      const invoice = maybeInvoice.value.getValue();

      // * System identifies invoice item by invoice Id
      const maybeInvoiceItems = await getInvoiceItems.execute(
        { invoiceId },
        defaultContext
      );
      if (!maybeInvoiceItems || maybeInvoiceItems.isLeft()) {
        throw new Errors.InvoiceItemNotFoundError(invoiceId);
      }
      const invoiceItem = maybeInvoiceItems[0].value.getValue();

      // * System identifies transaction by manuscript custom Id
      const maybeTransaction = await getTransaction.execute(
        { customId },
        defaultContext
      );
      if (!maybeTransaction || maybeTransaction.isLeft()) {
        throw new Errors.TransactionNotFoundError(manuscriptId);
      }
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

      return right(Result.ok<void>());
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
