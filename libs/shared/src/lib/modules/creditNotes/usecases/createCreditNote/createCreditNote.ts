// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { NotificationPause } from '../../../notifications/domain/NotificationPause';
import { Transaction } from '../../../transactions/domain/Transaction';
import { Invoice, InvoiceStatus } from '../../../invoices/domain/Invoice';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { CreditNote } from '../../domain/CreditNote';

import { InvoiceItemMap } from '../../../invoices/mappers/InvoiceItemMap';
import { InvoiceMap } from '../../../invoices/mappers/InvoiceMap';
import { CreditNoteMap } from '../../mappers/CreditNoteMap';

import { PausedReminderRepoContract } from '../../../notifications/repos/PausedReminderRepo';
import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';
import {
  InvoiceItemRepoContract,
  InvoiceRepoContract,
} from '../../../invoices/repos';
import { TransactionRepoContract } from '../../../transactions/repos';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import type { CreateCreditNoteRequestDTO as DTO } from './createCreditNoteDTO';
import { CreateCreditNoteResponse as Response } from './createCreditNoteResponse';
import { CreateCreditNoteErrors as Errors } from './createCreditNoteErrors';

export class CreateCreditNoteUsecase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private creditNoteRepo: CreditNoteRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private pausedReminderRepo: PausedReminderRepoContract
  ) {}

  private async getAccessControlContext(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<AccessControlContext> {
    return {};
  }

  @Authorize('create:credit_note')
  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    let transaction: Transaction;
    let invoice: Invoice;
    let items: InvoiceItem[];

    const invoiceId = InvoiceId.create(new UniqueEntityID(request.invoiceId));

    try {
      // * Identify transaction by invoice id
      try {
        const maybeTransaction = await this.transactionRepo.getTransactionByInvoiceId(
          invoiceId
        );
        if (maybeTransaction.isLeft()) {
          return left(new Errors.TransactionNotFoundError(request.invoiceId));
        }
        transaction = maybeTransaction.value;
      } catch (err) {
        return left(new Errors.TransactionNotFoundError(request.invoiceId));
      }

      // * Identify Invoice
      try {
        const maybeInvoice = await this.invoiceRepo.getInvoiceById(invoiceId);

        if (maybeInvoice.isLeft()) {
          return left(new Errors.InvoiceNotFoundError(request.invoiceId));
        }

        invoice = maybeInvoice.value;
      } catch (err) {
        return left(new Errors.InvoiceNotFoundError(request.invoiceId));
      }

      // * Check invoice status
      if (invoice.status === InvoiceStatus.DRAFT) {
        return left(new Errors.InvoiceIsDraftError(request.invoiceId));
      }

      // * Mark invoice as FINAL
      invoice.markAsFinal();

      await this.invoiceRepo.update(invoice);

      try {
        const maybeItems = await this.invoiceItemRepo.getItemsByInvoiceId(
          invoiceId
        );

        if (maybeItems.isLeft()) {
          return left(new Errors.InvoiceItemsNotFound(request.invoiceId));
        }

        items = maybeItems.value;
        for (const item of items) {
          const [coupons, waivers] = await Promise.all([
            this.couponRepo.getCouponsByInvoiceItemId(item.invoiceItemId),
            this.waiverRepo.getWaiversByInvoiceItemId(item.invoiceId),
          ]);
        }
      } catch (err) {
        return left(new Errors.InvoiceItemsNotFound(request.invoiceId));
      }

      invoice.addItems(items);

      let creditNoteProps = {
        id: new UniqueEntityID(),
        creationReason: request.reason,
        vat: invoice.invoiceVatTotal,
        price: invoice.invoiceNetTotal * -1,
        persistentReferenceNumber: invoice.persistentReferenceNumber,
        dateCreated: new Date(),
        dateIssued: new Date(),
        dateUpdated: null,
      };

      const maybeCreditNote = CreditNoteMap.toDomain(creditNoteProps);
      if (maybeCreditNote.isLeft()) {
        return left(maybeCreditNote.value);
      }

      const creditNote = maybeCreditNote.value;

      // * This assignment will trigger a CREDIT_NOTE_CREATED event

      creditNote.invoiceId = invoice.invoiceId;
      await this.creditNoteRepo.save(creditNote);

      if (request.createDraft) {
        const invoiceProps = {
          ...invoice.props,
          status: InvoiceStatus.DRAFT,
          dateMovedToFinal: null,
          invoiceNumber: null,
          erpReferences: null,
          cancelledInvoiceReference: null,
          persistentReferenceNumber: null,
          dateIssued: null,
        } as any; // TODO: should reference the real invoice props, as in its domain

        // * System creates DRAFT invoice

        // This is where all the magic happens
        const maybeDraftInvoice = InvoiceMap.toDomain(invoiceProps);
        if (maybeDraftInvoice.isLeft()) {
          return left(maybeDraftInvoice.value);
        }
        let draftInvoice = maybeDraftInvoice.value;
        if (items.length) {
          items.forEach(async (invoiceItem) => {
            const rawInvoiceItem = InvoiceItemMap.toPersistence(invoiceItem);
            rawInvoiceItem.invoiceId = draftInvoice.id.toString();
            rawInvoiceItem.price = invoiceItem.price;
            rawInvoiceItem.dateCreated = new Date();
            delete rawInvoiceItem.id;

            const draftInvoiceItem = InvoiceItemMap.toDomain(rawInvoiceItem);
            if (draftInvoiceItem.isLeft()) {
              return left(draftInvoiceItem.value);
            }
            draftInvoice.addInvoiceItem(draftInvoiceItem.value);

            await this.invoiceItemRepo.save(draftInvoiceItem.value);
          });
        }

        await this.invoiceRepo.save(draftInvoice);

        //* create notificationPause
        const reminderPause: NotificationPause = {
          invoiceId: draftInvoice.invoiceId,
          confirmation: false,
          payment: false,
        };
        await this.pausedReminderRepo.save(reminderPause);

        draftInvoice.generateCreatedEvent();
        DomainEvents.dispatchEventsForAggregate(draftInvoice.id);
      }

      DomainEvents.dispatchEventsForAggregate(invoice.id);
      DomainEvents.dispatchEventsForAggregate(creditNote.id);

      return right(creditNote);
    } catch (err) {
      throw new UnexpectedError(err);
    }
  }
}
