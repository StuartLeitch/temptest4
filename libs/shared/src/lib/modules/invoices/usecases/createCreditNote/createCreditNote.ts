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
import { Waiver } from '../../../../modules/waivers/domain/Waiver';
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

import { WaiverService } from '../../../../domain/services/WaiverService';

import type { CreateCreditNoteRequestDTO } from './createCreditNoteDTO';
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
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private pausedReminderRepo: PausedReminderRepoContract,
    private waiverService: WaiverService
  ) {}

  private async getAccessControlContext(
    request: CreateCreditNoteRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<AccessControlContext> {
    return {};
  }

  @Authorize('create:invoice')
  public async execute(
    request: CreateCreditNoteRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<CreateCreditNoteResponse> {
    let transaction: Transaction;
    let invoice: Invoice;
    let items: InvoiceItem[];

    // console.info(request);

    // * build the InvoiceId
    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();

    try {
      try {
        // * System identifies transaction by invoice Id
        transaction = await this.transactionRepo.getTransactionByInvoiceId(
          invoiceId
        );
      } catch (err) {
        return left(
          new CreateCreditNoteErrors.TransactionNotFoundError(request.invoiceId)
        );
      }

      try {
        // * System identifies invoice by Id
        invoice = await this.invoiceRepo.getInvoiceById(invoiceId);
      } catch (err) {
        return left(
          new CreateCreditNoteErrors.InvoiceNotFoundError(request.invoiceId)
        );
      }

      // * check invoice status
      if (invoice.status === InvoiceStatus.DRAFT) {
        return left(
          new CreateCreditNoteErrors.InvoiceIsDraftError(request.invoiceId)
        );
      }

      // * set the invoice status to FINAL
      invoice.markAsFinal();

      await this.invoiceRepo.update(invoice);

      try {
        items = await this.invoiceItemRepo.getItemsByInvoiceId(invoiceId);
        for (const item of items) {
          const [coupons, waivers] = await Promise.all([
            this.couponRepo.getCouponsByInvoiceItemId(item.invoiceItemId),
            this.waiverRepo.getWaiversByInvoiceItemId(item.invoiceItemId),
          ]);
          item.addAssignedCoupons(coupons);
          item.addAssignedWaivers(waivers);
        }
      } catch (err) {
        return left(new UnexpectedError('Bad Invoice Items!'));
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

      const creditNote = InvoiceMap.toDomain(clonedRawInvoice);

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

          const creditNoteInvoiceItem = InvoiceItemMap.toDomain(rawInvoiceItem);

          await this.invoiceItemRepo.save(creditNoteInvoiceItem);
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
        let draftInvoice = InvoiceMap.toDomain(invoiceProps);
        const waivers: Waiver[] = [];
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

            // * save coupons
            invoiceItem.assignedCoupons.coupons.forEach(async (c) => {
              await this.couponRepo.assignCouponToInvoiceItem(
                c,
                draftInvoiceItem.invoiceItemId
              );
            });

            waivers.push(...invoiceItem.assignedWaivers.waivers);
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

        // * save waivers
        await this.waiverService.applyHighestReductionWaiver(
          draftInvoice.invoiceId,
          waivers
        );

        draftInvoice.generateCreatedEvent();
        DomainEvents.dispatchEventsForAggregate(draftInvoice.id);
      }

      DomainEvents.dispatchEventsForAggregate(invoice.id);
      DomainEvents.dispatchEventsForAggregate(creditNote.id);

      return right(Result.ok<Invoice>(creditNote));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
