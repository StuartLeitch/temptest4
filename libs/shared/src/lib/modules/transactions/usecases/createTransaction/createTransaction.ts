/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Result, right, left } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import { WaiverService } from '../../../../domain/services/WaiverService';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { NotificationPause } from '../../../notifications/domain/NotificationPause';
import { InvoiceStatus, Invoice } from './../../../invoices/domain/Invoice';
import { TransactionStatus, Transaction } from '../../domain/Transaction';
import { CatalogItem } from './../../../journals/domain/CatalogItem';
import { InvoiceItem } from './../../../invoices/domain/InvoiceItem';
import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
import { JournalId } from './../../../journals/domain/JournalId';

import { PausedReminderRepoContract } from '../../../notifications/repos/PausedReminderRepo';
import { InvoiceItemRepoContract } from './../../../invoices/repos/invoiceItemRepo';
import { CatalogRepoContract } from './../../../journals/repos/catalogRepo';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { TransactionRepoContract } from '../../repos/transactionRepo';

import { CreateTransactionResponse as Response } from './createTransactionResponse';
import { CreateTransactionRequestDTO as DTO } from './createTransactionDTO';
import * as Errors from './createTransactionErrors';

type Context = UsecaseAuthorizationContext;

export class CreateTransactionUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private pausedReminderRepo: PausedReminderRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private catalogRepo: CatalogRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private waiverService: WaiverService
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:create')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let catalogItem: CatalogItem;

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    ).getValue();
    const journalId = JournalId.create(
      new UniqueEntityID(request.journalId)
    ).getValue();

    const transactionProps = {
      status: TransactionStatus.DRAFT,
    };

    try {
      // * System creates DRAFT transaction
      const transactionOrError = Transaction.create(transactionProps);
      if (transactionOrError.isFailure) {
        return left(new Errors.TransactionCreatedError());
      }

      const transaction = transactionOrError.getValue();

      // * System creates DRAFT invoice
      const invoiceProps = {
        status: InvoiceStatus.DRAFT,
        transactionId: transaction.transactionId,
      };

      const invoiceOrError = Invoice.create(invoiceProps);
      if (invoiceOrError.isFailure) {
        return left(new Errors.InvoiceCreatedError());
      }
      const invoice = invoiceOrError.getValue();

      //* System creates invoice item(s)
      const invoiceItemProps = {
        manuscriptId,
        invoiceId: invoice.invoiceId,
        dateCreated: new Date(),
      };

      const invoiceItemOrError = InvoiceItem.create(invoiceItemProps);
      if (invoiceItemOrError.isFailure) {
        return left(new Errors.InvoiceItemCreatedError());
      }
      const invoiceItem = invoiceItemOrError.getValue();

      try {
        // * System identifies catalog item
        catalogItem = await this.catalogRepo.getCatalogItemByJournalId(
          journalId
        );
      } catch (err) {
        return left(
          new Errors.CatalogItemNotFoundError(journalId.id.toString())
        );
      }

      const reminderPause: NotificationPause = {
        invoiceId: invoice.invoiceId,
        confirmation: false,
        payment: false,
      };

      // ! If no catalog item found for a given journalId
      if (catalogItem) {
        const { amount } = catalogItem;

        // * Set price for the Invoice Item
        invoiceItem.price = amount;

        await this.invoiceRepo.save(invoice);
        await this.invoiceItemRepo.save(invoiceItem);
        await this.transactionRepo.save(transaction);
        await this.pausedReminderRepo.save(reminderPause);

        //Event dispatch
        invoice.generateInvoiceDraftEvent();
        DomainEvents.dispatchEventsForAggregate(invoice.id);

        return right(Result.ok<Transaction>(transaction));
      } else {
        return left(
          new Errors.CatalogItemNotFoundError(journalId.id.toString())
        );
      }
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
