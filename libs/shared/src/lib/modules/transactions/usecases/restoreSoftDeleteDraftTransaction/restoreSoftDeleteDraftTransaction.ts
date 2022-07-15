// * Core Domain
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import { AccessControlledUsecase, AccessControlContext, Authorize } from '../../../../domain/authorization';

//* Repo Imports
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { TransactionRepoContract } from '../../repos/transactionRepo';

//* Usecase Imports
import { GetTransactionDetailsByManuscriptCustomIdUsecase } from '../../usecases/getTransactionDetailsByManuscriptCustomId';
import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../invoices/usecases/getInvoiceIdByManuscriptCustomId';
import { GetManuscriptByManuscriptIdUsecase } from '../../../manuscripts/usecases/getManuscriptByManuscriptId';
import { GetItemsForInvoiceUsecase } from '../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails';

import { RestoreSoftDeleteDraftTransactionResponse as Response } from './restoreSoftDeleteDraftTransaction.response';
import type { RestoreSoftDeleteDraftTransactionDTO as DTO } from './restoreSoftDeleteDraftTransaction.dto';
import * as Errors from './restoreSoftDeleteDraftTransaction.errors';

export class RestoreSoftDeleteDraftTransactionUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(
    private transactionRepo: TransactionRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract
  ) {
    super();
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
    const getInvoiceId = new GetInvoiceIdByManuscriptCustomIdUsecase(this.manuscriptRepo, this.invoiceItemRepo);
    const getInvoiceItems = new GetItemsForInvoiceUsecase(this.invoiceItemRepo, this.couponRepo, this.waiverRepo);
    const getManuscript = new GetManuscriptByManuscriptIdUsecase(this.manuscriptRepo);

    try {
      // * System identifies article by manuscript Id
      const maybeManuscript = await getManuscript.execute({ manuscriptId }, context);

      if (!maybeManuscript || maybeManuscript.isLeft()) {
        throw new Errors.ManuscriptNotFoundError(request.manuscriptId);
      }
      const manuscript = maybeManuscript.value;

      // * System obtains invoiceId by manuscript custom Id
      const customId = manuscript.customId;
      const maybeInvoiceId = await getInvoiceId.execute({ customId }, context);
      if (!maybeInvoiceId || maybeInvoiceId.isLeft()) {
        throw new Errors.InvoiceIdNotFoundError(customId);
      }

      const invoiceId = maybeInvoiceId.value[0].toString();

      // * System identifies invoice by invoice Id
      const maybeInvoice = await getInvoice.execute({ invoiceId }, context);
      if (!maybeInvoice || maybeInvoice.isLeft()) {
        throw new Errors.InvoiceNotFoundError(invoiceId);
      }

      const invoice = maybeInvoice.value;

      // * System identifies invoice item by invoice Id
      const maybeInvoiceItems = await getInvoiceItems.execute({ invoiceId }, context);
      if (!maybeInvoiceItems || maybeInvoiceItems.isLeft()) {
        throw new Errors.InvoiceItemNotFoundError(invoiceId);
      }
      const invoiceItem = maybeInvoiceItems.value[0];

      // * System identifies transaction by manuscript custom Id
      const maybeTransaction = await getTransaction.execute({ customId }, context);
      if (!maybeTransaction || maybeTransaction.isLeft()) {
        throw new Errors.TransactionNotFoundError(manuscriptId);
      }
      const transaction = maybeTransaction.value;
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

  private verifyData(request: DTO): Either<Errors.ManuscriptRequiredError, void> {
    if (!request.manuscriptId) {
      return left(new Errors.ManuscriptRequiredError());
    }
    return right(null);
  }
}
