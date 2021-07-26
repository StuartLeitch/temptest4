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
import { Transaction } from '../../../transactions/domain/Transaction';
import { InvoiceStatus, Invoice } from '../../domain/Invoice';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceId } from '../../domain/InvoiceId';

import { InvoiceItemMap } from '../../mappers/InvoiceItemMap';
import { InvoiceMap } from '../../mappers/InvoiceMap';

import { PausedReminderRepoContract } from '../../../notifications/repos/PausedReminderRepo';
import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import { CreateCreditNoteResponse as Response } from './createCreditNoteResponse';
import type { CreateCreditNoteRequestDTO as DTO } from './createCreditNoteDTO';
import * as Errors from './createCreditNoteErrors';

export class CreateCreditNoteUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private pausedReminderRepo: PausedReminderRepoContract
  ) {
    super();
  }

  @Authorize('creditNote:create')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let transaction: Transaction;
    let invoice: Invoice;
    let items: InvoiceItem[];

    // * build the InvoiceId
    const invoiceId = InvoiceId.create(new UniqueEntityID(request.invoiceId));

    try {
      try {
        // * System identifies transaction by invoice Id
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

      try {
        // * System identifies invoice by Id
        const maybeInvoice = await this.invoiceRepo.getInvoiceById(invoiceId);

        if (maybeInvoice.isLeft()) {
          return left(new Errors.InvoiceNotFoundError(request.invoiceId));
        }

        invoice = maybeInvoice.value;
      } catch (err) {
        return left(new Errors.InvoiceNotFoundError(request.invoiceId));
      }

      // * check invoice status
      if (invoice.status === InvoiceStatus.DRAFT) {
        return left(new Errors.InvoiceIsDraftError(request.invoiceId));
      }

      // * set the invoice status to FINAL
      invoice.markAsFinal();

      await this.invoiceRepo.update(invoice);

      try {
        const maybeItems = await this.invoiceItemRepo.getItemsByInvoiceId(
          invoiceId
        );

        if (maybeItems.isLeft()) {
          return left(new UnexpectedError(new Error(maybeItems.value.message)));
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
        return left(new UnexpectedError(err));
      }

      // * actually create the Credit Note
      const clonedRawInvoice = InvoiceMap.toPersistence(invoice);
      delete clonedRawInvoice.id;
      clonedRawInvoice.transactionId = transaction.transactionId.id.toString();
      clonedRawInvoice.dateCreated = new Date();
      clonedRawInvoice.dateIssued = null;
      clonedRawInvoice.persistentReferenceNumber = null;
      clonedRawInvoice.cancelledInvoiceReference = null;
      clonedRawInvoice.invoiceNumber = null;
      clonedRawInvoice.creationReason = request.reason;

      const maybeCreditNote = InvoiceMap.toDomain(clonedRawInvoice);
      if (maybeCreditNote.isLeft()) {
        return left(maybeCreditNote.value);
      }
      const creditNote = maybeCreditNote.value;

      if (items.length) {
        items.forEach(async (invoiceItem) => {
          const rawInvoiceItem = InvoiceItemMap.toPersistence(invoiceItem);
          rawInvoiceItem.invoiceId = creditNote.id.toString();
          rawInvoiceItem.price = invoiceItem.price * -1;
          rawInvoiceItem.dateCreated = new Date();
          delete rawInvoiceItem.id;

          invoiceItem.assignedCoupons.coupons.forEach((c) => {
            rawInvoiceItem.price -=
              ((invoiceItem.price * -1) / 100) * c.reduction;
          });

          invoiceItem.assignedWaivers.waivers.forEach((w) => {
            rawInvoiceItem.price -=
              ((invoiceItem.price * -1) / 100) * w.reduction;
          });

          const maybeCreditNoteInvoiceItem = InvoiceItemMap.toDomain(
            rawInvoiceItem
          );
          if (maybeCreditNoteInvoiceItem.isLeft()) {
            return left(maybeCreditNoteInvoiceItem.value);
          }

          await this.invoiceItemRepo.save(maybeCreditNoteInvoiceItem.value);
        });
      }

      // * Assign the cancelled invoice reference
      // * This assignment will trigger an INVOICE_CREDITED event

      creditNote.cancelledInvoiceReference = invoiceId.id.toString();
      creditNote.dateIssued = creditNote.dateCreated;
      creditNote.markAsFinal();

      await this.invoiceRepo.save(creditNote);

      // ? should generate a DRAFT invoice
      if (request.createDraft) {
        const invoiceProps = {
          ...clonedRawInvoice,
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

        draftInvoice.dateAccepted = creditNote.dateAccepted;

        await this.invoiceRepo.update(draftInvoice);

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
