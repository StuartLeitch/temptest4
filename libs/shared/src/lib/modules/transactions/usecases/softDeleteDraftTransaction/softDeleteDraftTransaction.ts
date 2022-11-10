// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlContext,
  AccessControlledUsecase,
  Authorize,
} from '../../../../domain/authorization';

import { Transaction, TransactionStatus } from '../../domain/Transaction';
import { ManuscriptId } from './../../../manuscripts/domain/ManuscriptId';
import { Manuscript } from './../../../manuscripts/domain/Manuscript';
import { InvoiceItem } from './../../../invoices/domain/InvoiceItem';
import { Invoice, InvoiceStatus } from './../../../invoices/domain/Invoice';

import { ArticleRepoContract as ManuscriptRepoContract } from './../../../manuscripts/repos/articleRepo';
import { InvoiceItemRepoContract } from './../../../invoices/repos/invoiceItemRepo';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { TransactionRepoContract } from '../../repos/transactionRepo';

import type { SoftDeleteDraftTransactionRequestDTO as DTO } from './softDeleteDraftTransactionDTO';
import { SoftDeleteDraftTransactionResponse as Response } from './softDeleteDraftTransactionResponse';
import * as Errors from './softDeleteDraftTransactionErrors';
import { LoggerContract } from '../../../../infrastructure/logging';

export class SoftDeleteDraftInvoiceUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(
    private transactionRepo: TransactionRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private manuscriptRepo: ManuscriptRepoContract,
    private logger: LoggerContract
  ) {
    super();
  }

  @Authorize('transaction:delete')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let invoiceItem: InvoiceItem;
    let invoice: Invoice;
    let transaction: Transaction;
    let manuscript: Manuscript;

    // * build the ManuscriptId
    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    );

    try {
      try {
        // * System identifies article by manuscript Id
        const maybeManuscript = await this.manuscriptRepo.findById(
          manuscriptId
        );
        if (maybeManuscript.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeManuscript.value.message))
          );
        }

        manuscript = maybeManuscript.value;
      } catch (err) {
        return left(new Errors.InvoiceItemNotFoundError(request.manuscriptId));
      }

      try {
        // * System identifies invoice item by manuscript Id
        const maybeInvoiceItems =
          await this.invoiceItemRepo.getInvoiceItemByManuscriptId(manuscriptId);

        if (maybeInvoiceItems.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeInvoiceItems.value.message))
          );
        }

        invoiceItem = maybeInvoiceItems.value[0];
      } catch (err) {
        return left(new Errors.InvoiceItemNotFoundError(request.manuscriptId));
      }

      try {
        // * System identifies invoice by invoice item Id
        const maybeInvoice = await this.invoiceRepo.getInvoiceById(
          invoiceItem.invoiceId
        );

        if (maybeInvoice.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeInvoice.value.message))
          );
        }

        invoice = maybeInvoice.value;
      } catch (err) {
        return left(
          new Errors.InvoiceNotFoundError(
            invoiceItem.invoiceItemId.id.toString()
          )
        );
      }

      if (invoice.status !== InvoiceStatus.DRAFT) {
        this.logger.info(
          `Attempted to soft delete a non draft invoice. Soft delete ignored. invoiceId: '${invoice.id.toString()}'`
        );
        return right(null);
      } else {
        this.logger.info(
          `Soft deleting invoice with invoiceId: '${invoice.id.toString()}'`
        );
      }

      try {
        // * System identifies transaction by invoice Id
        const maybeTransaction = await this.transactionRepo.getTransactionById(
          invoice.transactionId
        );

        if (maybeTransaction.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeTransaction.value.message))
          );
        }

        transaction = maybeTransaction.value;
      } catch (err) {
        return left(
          new Errors.TransactionNotFoundError(invoice.invoiceId.id.toString())
        );
      }

      // This is where all the magic happens!

      if (transaction.status === TransactionStatus.ACTIVE) {
        return right(null);
      }

      // * System soft deletes transaction
      await this.transactionRepo.delete(transaction);
      // * System soft deletes invoice
      await this.invoiceRepo.delete(invoice);
      // * System soft deletes invoice item
      await this.invoiceItemRepo.delete(invoiceItem);
      // * System soft deletes manuscript
      await this.manuscriptRepo.delete(manuscript);

      invoice.generateInvoiceDraftDeletedEvent();
      DomainEvents.dispatchEventsForAggregate(invoice.id);

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
