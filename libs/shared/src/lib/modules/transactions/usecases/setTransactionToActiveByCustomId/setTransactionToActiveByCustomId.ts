// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import { DomainEvents } from '../../../../core/domain/events/DomainEvents';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { CatalogItem } from '../../../journals/domain/CatalogItem';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { JournalId } from '../../../journals/domain/JournalId';
import { Invoice } from '../../../invoices/domain/Invoice';
import { Transaction } from '../../domain/Transaction';

import { InvoiceItemRepoContract } from './../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { TransactionRepoContract } from '../../repos/transactionRepo';
import { CatalogRepoContract } from '../../../journals/repos';

// * Usecase specifics
import { SetTransactionToActiveByCustomIdResponse as Response } from './setTransactionToActiveByCustomIdResponse';
import { SetTransactionToActiveByCustomIdDTO as DTO } from './setTransactionToActiveByCustomIdDTO';
import * as Errors from './setTransactionToActiveByCustomIdErrors';

export class SetTransactionToActiveByCustomIdUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private catalogRepo: CatalogRepoContract,
    private transactionRepo: TransactionRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private articleRepo: ArticleRepoContract
  ) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    let transaction: Transaction;
    let invoice: Invoice;
    let invoiceItem: InvoiceItem;
    let manuscript: Manuscript;
    let catalogItem: CatalogItem;

    try {
      try {
        // * System identifies manuscript by custom Id
        const maybeManuscript = await this.articleRepo.findByCustomId(
          request.customId
        );

        if (maybeManuscript.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeManuscript.value.message))
          );
        }

        manuscript = maybeManuscript.value;
      } catch (err) {
        return left(new Errors.ManuscriptNotFoundError(request.customId));
      }

      // * get a proper ManuscriptId
      const manuscriptId = manuscript.manuscriptId;

      try {
        // * System identifies invoice item by manuscript Id
        const maybeInvoiceItems = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(
          manuscriptId
        );

        if (maybeInvoiceItems.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeInvoiceItems.value.message))
          );
        }

        invoiceItem = maybeInvoiceItems.value[0];
      } catch (err) {
        return left(
          new Errors.InvoiceItemNotFoundError(manuscriptId.id.toString())
        );
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
          new Errors.InvoiceNotFoundError(invoiceItem.invoiceId.id.toString())
        );
      }

      try {
        // * System looks-up the transaction
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

      try {
        // * System looks-up the catalog item for the manuscript
        const maybeCatalogItem = await this.catalogRepo.getCatalogItemByJournalId(
          JournalId.create(new UniqueEntityID(manuscript.journalId))
        );

        if (maybeCatalogItem.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeCatalogItem.value.message))
          );
        }

        catalogItem = maybeCatalogItem.value;
      } catch (err) {
        return left(new Errors.CatalogItemNotFoundError(manuscript.journalId));
      }

      // * Mark transaction as ACTIVE
      transaction.markAsActive();

      await this.transactionRepo.update(transaction);
      await this.invoiceRepo.update(invoice);

      invoice.generateCreatedEvent();
      DomainEvents.dispatchEventsForAggregate(invoice.id);

      return right(transaction);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
