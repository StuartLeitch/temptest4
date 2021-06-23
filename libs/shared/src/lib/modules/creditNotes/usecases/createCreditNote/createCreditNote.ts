// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Result, right, left } from '../../../../core/logic/Result';
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

import { CreateCreditNoteRequestDTO } from './createCreditNoteDTO';
import { CreateCreditNoteResponse } from './createCreditNoteResponse';
import { CreateCreditNoteErrors } from './createCreditNoteErrors';

export class CreateCreditNoteUsecase
  implements
    UseCase<
      CreateCreditNoteRequestDTO,
      Promise<CreateCreditNoteResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      CreateCreditNoteRequestDTO,
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
    request: CreateCreditNoteRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<AccessControlContext> {
    return {};
  }

  @Authorize('create:credit_note')
  public async execute(
    request: CreateCreditNoteRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<CreateCreditNoteResponse> {
    let transaction: Transaction;
    let invoice: Invoice;
    let items: InvoiceItem[];

    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();

    try {
      // * Identify transaction by invoice id
      try {
        transaction = await this.transactionRepo.getTransactionByInvoiceId(
          invoiceId
        );
      } catch (err) {
        throw new CreateCreditNoteErrors.TransactionNotFoundError(
          request.invoiceId
        );
      }

      // * Identify Invoice
      try {
        invoice = await this.invoiceRepo.getInvoiceById(invoiceId);
      } catch (err) {
        throw new CreateCreditNoteErrors.InvoiceNotFoundError(
          request.invoiceId
        );
      }

      // * Check invoice status
      if (invoice.status === InvoiceStatus.DRAFT) {
        throw new CreateCreditNoteErrors.InvoiceIsDraftError(request.invoiceId);
      }

      // * Mark invoice as FINAL
      invoice.markAsFinal();

      await this.invoiceRepo.update(invoice);

      try {
        items = await this.invoiceItemRepo.getItemsByInvoiceId(invoiceId);
        for (const item of items) {
          const [coupons, waivers] = await Promise.all([
            this.couponRepo.getCouponsByInvoiceItemId(item.invoiceItemId),
            this.waiverRepo.getWaiversByInvoiceItemId(item.invoiceId),
          ]);
        }
      } catch (err) {
        throw new UnexpectedError('Bad Invoice Items');
      }

      invoice.addItems(items);

      let creditNoteProps = {
        id: new UniqueEntityID(),
        invoiceId: request.invoiceId,
        creationReason: request.reason,
        vat: invoice.invoiceVatTotal,
        price: invoice.invoiceNetTotal,
        persistentReferenceNumber: invoice.persistentReferenceNumber,
        dateCreated: new Date(),
        dateIssued: new Date(),
        dateUpdated: null,
      };

      const creditNote = CreditNoteMap.toDomain(creditNoteProps);

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
        let draftInvoice = InvoiceMap.toDomain(invoiceProps);
        if (items.length) {
          items.forEach(async (invoiceItem) => {
            const rawInvoiceItem = InvoiceItemMap.toPersistence(invoiceItem);
            rawInvoiceItem.invoiceId = draftInvoice.id.toString();
            rawInvoiceItem.price = invoiceItem.price;
            rawInvoiceItem.dateCreated = new Date();
            delete rawInvoiceItem.id;

            const draftInvoiceItem = InvoiceItemMap.toDomain(rawInvoiceItem);
            draftInvoice.addInvoiceItem(draftInvoiceItem);

            await this.invoiceItemRepo.save(draftInvoiceItem);
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

      return right(Result.ok<CreditNote>(creditNote));
    } catch (err) {
      throw new UnexpectedError(err);
    }
  }
}
