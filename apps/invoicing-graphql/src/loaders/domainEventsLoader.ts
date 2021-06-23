/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';

import { PublishCreditNoteCreatedUsecase } from '../../../../libs/shared/src/lib/modules/creditNotes/usecases/publishEvents/publishCreditNoteCreated/publishCreditNoteCreated';
import { PublishInvoiceCreditedUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishEvents/publishInvoiceCredited/publishInvoiceCredited';
import { PublishInvoiceDraftCreatedUseCase } from 'libs/shared/src/lib/modules/invoices/usecases/publishEvents/publishInvoiceDraftCreated';
import { PublishInvoiceDraftDeletedUseCase } from 'libs/shared/src/lib/modules/invoices/usecases/publishEvents/publishInvoiceDraftDeleted';
import { PublishInvoiceDraftDueAmountUpdatedUseCase } from 'libs/shared/src/lib/modules/invoices/usecases/publishEvents/publishInvoiceDraftDueAmountUpdated';
import { PublishInvoiceCreatedUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishEvents/publishInvoiceCreated/publishInvoiceCreated';
import { PublishInvoiceConfirmedUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishEvents/publishInvoiceConfirmed';
import { PublishInvoiceFinalizedUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishEvents/publishInvoiceFinalized';
import { PublishInvoicePaidUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishEvents/publishInvoicePaid';
import { PublishRevenueRecognitionReversalUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/ERP/publishRevenueRecognitionReversal/publishRevenueRecognitionReversal';

import { AfterCreditNoteCreatedEvent } from '../../../../libs/shared/src/lib/modules/creditNotes/usecases/subscriptions/AfterCreditNoteCreatedEvent';
import { AfterInvoiceCreditNoteCreatedEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceCreditNoteCreatedEvents';
import { AfterInvoiceDraftDueAmountUpdatedEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceDueAmountUpdateEvent';
import { AfterInvoiceDraftDeletedEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceDraftDeletedEvent';
import { AfterInvoiceDraftCreatedEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceDraftCreatedEvent';
import { AfterInvoiceCreatedEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceCreatedEvents';
import { AfterInvoiceConfirmed } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/afterInvoiceConfirmedEvent';
import { AfterInvoiceFinalized } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceFinalizedEvent';
import { AfterInvoicePaidEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoicePaidEvents';
import { AfterPaymentCompleted } from './../../../../libs/shared/src/lib/modules/payments/subscriptions/after-payment-completed';

import { Context } from '../builders';
import { env } from '../env';

export const domainEventsRegisterLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context: Context = settings.getData('context');
    const {
      repos: {
        paymentMethod,
        invoiceItem,
        manuscript,
        creditNote,
        address,
        invoice,
        payment,
        coupon,
        waiver,
        payer,
        erpReference,
        catalog,
        publisher,
      },
      services: { logger: loggerService, schedulingService, qq: queue, erp },
    } = context;

    const publishCreditNoteCreated = new PublishCreditNoteCreatedUsecase(queue);

    const publishRevenueRecognitionReversal = new PublishRevenueRecognitionReversalUsecase(
      invoice,
      invoiceItem,
      coupon,
      waiver,
      payer,
      address,
      manuscript,
      catalog,
      publisher,
      erpReference,
      erp?.netsuite ?? null,
      loggerService
    );

    const publishInvoiceDraftCreated = new PublishInvoiceDraftCreatedUseCase(
      queue
    );
    const publishInvoiceDraftDeleted = new PublishInvoiceDraftDeletedUseCase(
      queue
    );
    const publishInvoiceDraftDueAmountUpdated = new PublishInvoiceDraftDueAmountUpdatedUseCase(
      queue
    );
    const publishInvoiceCreatedUsecase = new PublishInvoiceCreatedUsecase(
      queue
    );
    const publishInvoiceConfirmed = new PublishInvoiceConfirmedUsecase(queue);
    const publishInvoiceFinalized = new PublishInvoiceFinalizedUsecase(queue);
    const publishInvoiceCredited = new PublishInvoiceCreditedUsecase(queue);
    const publishInvoicePaid = new PublishInvoicePaidUsecase(queue);

    // * Registering Invoice Events
    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceDraftCreatedEvent(
      invoice,
      invoiceItem,
      manuscript,
      coupon,
      waiver,
      publishInvoiceDraftCreated
    );

    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceDraftDeletedEvent(
      invoice,
      invoiceItem,
      manuscript,
      coupon,
      waiver,
      publishInvoiceDraftDeleted
    );

    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceDraftDueAmountUpdatedEvent(
      invoice,
      invoiceItem,
      manuscript,
      coupon,
      waiver,
      publishInvoiceDraftDueAmountUpdated
    );

    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceCreatedEvent(
      invoice,
      invoiceItem,
      manuscript,
      publishInvoiceCreatedUsecase,
      schedulingService,
      env.scheduler.confirmationReminderDelay,
      env.scheduler.emailRemindersQueue
    );

    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceCreditNoteCreatedEvent(
      paymentMethod,
      invoiceItem,
      manuscript,
      address,
      invoice,
      payment,
      coupon,
      waiver,
      payer,
      publishInvoiceCredited,
      publishRevenueRecognitionReversal,
      loggerService
    );

    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceConfirmed(
      invoiceItem,
      coupon,
      waiver,
      payer,
      address,
      manuscript,
      publishInvoiceConfirmed,
      schedulingService,
      loggerService,
      env.scheduler.creditControlReminderDelay,
      env.scheduler.paymentReminderDelay,
      env.scheduler.emailRemindersQueue
    );

    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceFinalized(
      paymentMethod,
      invoiceItem,
      manuscript,
      address,
      payment,
      coupon,
      waiver,
      payer,
      publishInvoiceFinalized,
      loggerService
    );

    // tslint:disable-next-line: no-unused-expression
    new AfterInvoicePaidEvent(
      paymentMethod,
      invoiceItem,
      manuscript,
      address,
      invoice,
      payment,
      coupon,
      waiver,
      payer,
      publishInvoicePaid,
      loggerService
    );

    // tslint:disable-next-line: no-unused-expression
    new AfterPaymentCompleted(invoice, loggerService);

    // * Registering CreditNote events

    new AfterCreditNoteCreatedEvent(
      creditNote,
      paymentMethod,
      invoiceItem,
      manuscript,
      address,
      invoice,
      payment,
      coupon,
      waiver,
      payer,
      publishCreditNoteCreated,
      publishRevenueRecognitionReversal,
      loggerService
    );
  }
};
