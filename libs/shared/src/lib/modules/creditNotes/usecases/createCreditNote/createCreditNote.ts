// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { NotificationPause } from '../../../notifications/domain/NotificationPause';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import {
  InvoiceStatus,
  InvoiceProps,
  Invoice,
} from '../../../invoices/domain/Invoice';

import { InvoiceItemMap } from '../../../invoices/mappers/InvoiceItemMap';
import { InvoiceMap } from '../../../invoices/mappers/InvoiceMap';
import { CreditNoteMap } from '../../mappers/CreditNoteMap';

import { PausedReminderRepoContract } from '../../../notifications/repos/PausedReminderRepo';
import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';
import {
  InvoiceItemRepoContract,
  InvoiceRepoContract,
} from '../../../invoices/repos';

import { CreateCreditNoteResponse as Response } from './createCreditNoteResponse';
import type { CreateCreditNoteRequestDTO as DTO } from './createCreditNoteDTO';
import * as Errors from './createCreditNoteErrors';

export class CreateCreditNoteUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private creditNoteRepo: CreditNoteRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private pausedReminderRepo: PausedReminderRepoContract
  ) {
    super();
  }

  @Authorize('creditNote:create')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let invoice: Invoice;
    let items: InvoiceItem[];

    const invoiceId = InvoiceId.create(new UniqueEntityID(request.invoiceId));

    try {
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
          const [maybeCoupons, maybeWaivers] = await Promise.all([
            this.couponRepo.getCouponsByInvoiceItemId(item.invoiceItemId),
            this.waiverRepo.getWaiversByInvoiceItemId(item.invoiceItemId),
          ]);

          if (maybeCoupons.isLeft()) {
            return left(
              new UnexpectedError(new Error(maybeCoupons.value.message))
            );
          }

          if (maybeWaivers.isLeft()) {
            return left(
              new UnexpectedError(new Error(maybeWaivers.value.message))
            );
          }

          item.addAssignedCoupons(maybeCoupons.value);
          item.addAssignedWaivers(maybeWaivers.value);
        }
      } catch (err) {
        return left(new Errors.InvoiceItemsNotFound(request.invoiceId));
      }

      invoice.addItems(items);

      const creditNoteProps = {
        id: new UniqueEntityID(),
        creationReason: request.reason,
        vat: invoice.getInvoicePercentage(),
        price: invoice.netTotalBeforeDiscount * -1,
        persistentReferenceNumber: `CN-${invoice.persistentReferenceNumber}`,
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
          persistentReferenceNumber: null,
          dateCreated: new Date(),
          dateIssued: null,
        } as InvoiceProps; // TODO: should reference the real invoice props, as in its domain

        // * System creates DRAFT invoice

        // This is where all the magic happens
        const maybeDraftInvoice = InvoiceMap.toDomain(invoiceProps);
        if (maybeDraftInvoice.isLeft()) {
          return left(maybeDraftInvoice.value);
        }
        const draftInvoice = maybeDraftInvoice.value;
        if (items.length) {
          items.forEach(async (invoiceItem) => {
            const rawInvoiceItem = InvoiceItemMap.toPersistence(invoiceItem);
            rawInvoiceItem.invoiceId = draftInvoice.id.toString();
            rawInvoiceItem.price = invoiceItem.price;
            rawInvoiceItem.dateCreated = new Date();
            rawInvoiceItem.vat = 0;
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
      return left(new UnexpectedError(err));
    }
  }
}
