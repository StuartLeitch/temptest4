/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
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
import { InvoiceItem } from './../../../invoices/domain/InvoiceItem';
import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { JournalId } from './../../../journals/domain/JournalId';
import { Waiver } from '../../../waivers/domain/Waiver';

import { PausedReminderRepoContract } from '../../../notifications/repos/PausedReminderRepo';
import { InvoiceItemRepoContract } from './../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { CatalogRepoContract } from './../../../journals/repos/catalogRepo';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { TransactionRepoContract } from '../../repos/transactionRepo';

import { CreateTransactionResponse as Response } from './createTransactionResponse';
import type { CreateTransactionRequestDTO as DTO } from './createTransactionDTO';
import * as Errors from './createTransactionErrors';
import {
  WithManuscriptId,
  WithInvoiceItem,
  WithTransaction,
  WithManuscript,
  WithJournalId,
  WithInvoice,
  WithJournal,
} from './helper-types';

type Context = UsecaseAuthorizationContext;

export class CreateTransactionUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private pausedReminderRepo: PausedReminderRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private catalogRepo: CatalogRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private waiverService: WaiverService
  ) {
    this.createInvoiceItems = this.createInvoiceItems.bind(this);
    this.saveRemindersState = this.saveRemindersState.bind(this);
    this.createTransaction = this.createTransaction.bind(this);
    this.calculateWaivers = this.calculateWaivers.bind(this);
    this.saveInvoiceItem = this.saveInvoiceItem.bind(this);
    this.saveTransaction = this.saveTransaction.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.createInvoice = this.createInvoice.bind(this);
    this.getManuscript = this.getManuscript.bind(this);
    this.saveInvoice = this.saveInvoice.bind(this);
    this.getCatalog = this.getCatalog.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:create')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = await new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.createTransaction)
        .then(this.createInvoice)
        .then(this.createInvoiceItems)
        .then(this.getCatalog)
        .map(this.setInvoicePrice)
        .then(this.getManuscript)
        .then(this.calculateWaivers)
        .then(this.saveInvoice)
        .then(this.saveInvoiceItem)
        .then(this.saveTransaction)
        .then(this.saveRemindersState)
        .map(this.dispatchDomainEvents)
        .map((data) => data.transaction)
        .execute();

      return execution;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async validateRequest<T extends DTO>(
    data: T
  ): Promise<
    Either<Errors.ManuscriptIdRequiredError | Errors.JournalIdRequiredError, T>
  > {
    if (!data.manuscriptId) {
      return left(new Errors.ManuscriptIdRequiredError());
    }

    if (!data.journalId) {
      return left(new Errors.JournalIdRequiredError());
    }

    return right(data);
  }

  private async createTransaction<T>(
    data: T
  ): Promise<Either<Errors.TransactionCreatedError, T & WithTransaction>> {
    const transactionOrError = Transaction.create({
      status: TransactionStatus.DRAFT,
    });
    if (transactionOrError.isFailure) {
      const err = (transactionOrError.errorValue() as unknown) as Error;
      return left(new Errors.TransactionCreatedError(err));
    }

    return right({
      ...data,
      transaction: transactionOrError.getValue(),
    });
  }

  private async createInvoice<T extends WithTransaction>(
    data: T
  ): Promise<Either<Errors.InvoiceCreatedError, T & WithInvoice>> {
    const invoiceProps = {
      transactionId: data.transaction.transactionId,
      status: InvoiceStatus.DRAFT,
    };

    const invoiceOrError = Invoice.create(invoiceProps);
    if (invoiceOrError.isFailure) {
      return left(
        new Errors.InvoiceCreatedError(
          (invoiceOrError.errorValue() as unknown) as Error
        )
      );
    }
    return right({
      ...data,
      invoice: invoiceOrError.getValue(),
    });
  }

  private async createInvoiceItems<T extends WithInvoice & WithManuscriptId>(
    data: T
  ): Promise<Either<Errors.InvoiceItemCreatedError, T & WithInvoiceItem>> {
    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(data.manuscriptId)
    ).getValue();
    const invoiceItemProps = {
      manuscriptId,
      invoiceId: data.invoice.invoiceId,
      dateCreated: new Date(),
    };

    const invoiceItemOrError = InvoiceItem.create(invoiceItemProps);
    if (invoiceItemOrError.isFailure) {
      return left(
        new Errors.InvoiceItemCreatedError(
          (invoiceItemOrError.errorValue() as unknown) as Error
        )
      );
    }
    return right({
      ...data,
      invoiceItem: invoiceItemOrError.getValue(),
    });
  }

  private async getCatalog<T extends WithJournalId>(
    data: T
  ): Promise<Either<Errors.CatalogItemNotFoundError, T & WithJournal>> {
    const journalId = JournalId.create(
      new UniqueEntityID(data.journalId)
    ).getValue();
    try {
      // * System identifies catalog item
      const catalogItem = await this.catalogRepo.getCatalogItemByJournalId(
        journalId
      );

      if (!catalogItem) {
        return left(
          new Errors.CatalogItemNotFoundError(journalId.id.toString())
        );
      }

      return right({
        ...data,
        journal: catalogItem,
      });
    } catch (err) {
      return left(new Errors.CatalogItemNotFoundError(journalId.id.toString()));
    }
  }

  private setInvoicePrice<T extends WithInvoiceItem & WithJournal>(data: T): T {
    const { invoiceItem, journal } = data;

    invoiceItem.price = journal.amount;

    return {
      ...data,
      invoiceItem,
    };
  }

  private async saveInvoice<T extends WithInvoice>(
    data: T
  ): Promise<Either<Errors.SaveInvoiceError, T>> {
    try {
      const invoice = await this.invoiceRepo.save(data.invoice);

      return right({
        ...data,
        invoice,
      });
    } catch (err) {
      return left(new Errors.SaveInvoiceError(err));
    }
  }

  private async saveInvoiceItem<T extends WithInvoiceItem>(
    data: T
  ): Promise<Either<Errors.SaveInvoiceItemError, T>> {
    try {
      const invoiceItem = await this.invoiceItemRepo.save(data.invoiceItem);

      return right({
        ...data,
        invoiceItem,
      });
    } catch (err) {
      return left(new Errors.SaveInvoiceItemError(err));
    }
  }

  private async saveTransaction<T extends WithTransaction>(
    data: T
  ): Promise<Either<Errors.SaveTransactionError, T>> {
    try {
      const transaction = await this.transactionRepo.save(data.transaction);

      return right({
        ...data,
        transaction,
      });
    } catch (err) {
      return left(new Errors.SaveTransactionError(err));
    }
  }

  private async saveRemindersState<T extends WithInvoice>(
    data: T
  ): Promise<Either<Errors.SaveRemindersStateError, T>> {
    const reminderPause: NotificationPause = {
      invoiceId: data.invoice.invoiceId,
      confirmation: false,
      payment: false,
    };

    try {
      await this.pausedReminderRepo.save(reminderPause);

      return right(data);
    } catch (err) {
      return left(new Errors.SaveRemindersStateError(err));
    }
  }

  private dispatchDomainEvents<T extends WithInvoice>(data: T) {
    data.invoice.generateInvoiceDraftEvent();
    DomainEvents.dispatchEventsForAggregate(data.invoice.id);

    return data;
  }

  private async getManuscript<T extends WithManuscriptId>(
    data: T
  ): Promise<Either<Errors.ManuscriptNotFoundError, T & WithManuscript>> {
    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(data.manuscriptId)
    ).getValue();

    try {
      const manuscript: Manuscript = await this.manuscriptRepo.findById(
        manuscriptId
      );

      if (!manuscript) {
        return left(new Errors.ManuscriptNotFoundError(data.manuscriptId));
      }

      return right({
        ...data,
        manuscript,
      });
    } catch (err) {
      return left(new Errors.ManuscriptNotFoundError(data.manuscriptId));
    }
  }

  private async calculateWaivers<T extends WithManuscript & WithInvoice>(
    data: T
  ): Promise<Either<Errors.WaiversCalculationError, T & { waiver: Waiver }>> {
    const { manuscript, invoice } = data;
    try {
      const waiver = await this.waiverService.applyWaiver({
        authorEmail: manuscript.authorEmail,
        country: manuscript.authorCountry,
        invoiceId: invoice.id.toString(),
        journalId: manuscript.journalId,
      });

      return right({ ...data, waiver });
    } catch (err) {
      return left(new Errors.WaiversCalculationError(err));
    }
  }
}
