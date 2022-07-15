// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import { AccessControlledUsecase, AccessControlContext, Authorize } from '../../../../domain/authorization';

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { ManuscriptId } from '../../../manuscripts/domain/ManuscriptId';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { Invoice } from '../../../invoices/domain/Invoice';

import { SetTransactionStatusToActiveResponse as Response } from './setTransactionStatusToActiveResponse';
import type { SetTransactionStatusToActiveDTO as DTO } from './setTransactionStatusToActiveDTO';
import * as Errors from './setTransactionStatusToActiveErrors';
import { InvoiceRepoContract } from '../../../invoices/repos';
import { Transaction } from '../../domain/Transaction';
import { TransactionRepoContract } from '../../repos';
import { LoggerContract } from '../../../../infrastructure/logging';

export class SetTransactionStatusToActiveUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private transactionRepo: TransactionRepoContract,
    private logger: LoggerContract
  ) {
    super();
  }

  @Authorize('transaction:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let invoiceItem: InvoiceItem;
    let invoice: Invoice;
    let transaction: Transaction;

    const manuscriptId = ManuscriptId.create(new UniqueEntityID(request.manuscriptId));

    try {
      try {
        // * System identifies invoice item by manuscript Id
        const maybeInvoiceItem = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(manuscriptId);

        if (maybeInvoiceItem.isLeft()) {
          return left(new UnexpectedError(new Error(maybeInvoiceItem.value.message)));
        }

        invoiceItem = maybeInvoiceItem.value[0];
      } catch (err) {
        return left(new Errors.InvoiceItemNotFoundError(request.manuscriptId));
      }

      try {
        // * System identifies invoice by invoice item Id
        const maybeInvoice = await this.invoiceRepo.getInvoiceById(invoiceItem.invoiceId);

        if (maybeInvoice.isLeft()) {
          return left(new UnexpectedError(new Error(maybeInvoice.value.message)));
        }

        invoice = maybeInvoice.value;
      } catch (err) {
        return left(new Errors.InvoiceNotFoundError(invoiceItem.invoiceId.id.toString()));
      }

      invoice.addInvoiceItem(invoiceItem);

      try {
        // * System looks-up the transaction
        const maybeTransaction = await this.transactionRepo.getTransactionById(invoice.transactionId);

        if (maybeTransaction.isLeft()) {
          return left(new UnexpectedError(new Error(maybeTransaction.value.message)));
        }

        transaction = maybeTransaction.value;
      } catch (err) {
        return left(new Errors.TransactionNotFoundError(invoice.invoiceId.id.toString()));
      }

      if (invoice.dateAccepted == null) {
        invoice.dateAccepted = new Date();
        await this.invoiceRepo.update(invoice);
      }

      transaction.markAsActive();
      await this.transactionRepo.update(transaction);


      return right(null);
    } catch (err) {
      this.logger.error(`An error occurred: ${err.value.message}`);
      return left(new UnexpectedError(err.value.message));
    }
  }
}
