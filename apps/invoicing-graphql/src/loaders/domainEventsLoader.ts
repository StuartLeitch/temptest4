import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import {
  PublishInvoiceDraftDueAmountUpdatedUseCase,
  AfterInvoiceDraftDueAmountUpdatedEvent,
  PublishInvoiceDraftCreatedUseCase,
  PublishInvoiceDraftDeletedUseCase,
  PublishCreditNoteCreatedUsecase,
  PublishJournalAPCUpdatedUsecase,
  PublishInvoiceConfirmedUsecase,
  PublishInvoiceFinalizedUsecase,
  AfterInvoiceDraftCreatedEvent,
  AfterInvoiceDraftDeletedEvent,
  PublishInvoiceCreatedUsecase,
  AfterCreditNoteCreatedEvent,
  AfterInvoiceMovedToPending,
  PublishInvoicePaidUsecase,
  AfterInvoiceCreatedEvent,
  AfterJournalAPCUpdated,
  AfterInvoiceConfirmed,
  AfterInvoiceFinalized,
  AfterInvoicePaidEvent,
  AfterPaymentCompleted,
} from '@hindawi/shared';

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
        catalog,
        creditNote,
        address,
        invoice,
        payment,
        coupon,
        waiver,
        payer,
      },
      services: {
        schedulingService,
        emailService,
        commsEmailService,
        queue: queue,
      },
      loggerBuilder,
    } = context;

    const loggerService = loggerBuilder.getLogger('DomainEvent');

    const publishInvoiceDraftCreated = new PublishInvoiceDraftCreatedUseCase(
      queue
    );
    const publishInvoiceDraftDeleted = new PublishInvoiceDraftDeletedUseCase(
      queue
    );
    const publishInvoiceDraftDueAmountUpdated =
      new PublishInvoiceDraftDueAmountUpdatedUseCase(queue);
    const publishInvoiceCreatedUsecase = new PublishInvoiceCreatedUsecase(
      queue
    );
    const publishInvoiceConfirmed = new PublishInvoiceConfirmedUsecase(queue);
    const publishInvoiceFinalized = new PublishInvoiceFinalizedUsecase(queue);
    const publishInvoiceCredited = new PublishCreditNoteCreatedUsecase(queue);
    const publishInvoicePaid = new PublishInvoicePaidUsecase(queue);
    const publishJournalAPCUpdated = new PublishJournalAPCUpdatedUsecase(queue);

    // * Registering Invoice Events
    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceDraftCreatedEvent(
      invoice,
      invoiceItem,
      manuscript,
      coupon,
      waiver,
      publishInvoiceDraftCreated,
      loggerService
    );

    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceDraftDeletedEvent(
      invoice,
      invoiceItem,
      manuscript,
      coupon,
      waiver,
      publishInvoiceDraftDeleted,
      loggerService
    );

    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceDraftDueAmountUpdatedEvent(
      invoice,
      invoiceItem,
      manuscript,
      coupon,
      waiver,
      publishInvoiceDraftDueAmountUpdated,
      loggerService
    );

    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceCreatedEvent(
      invoice,
      invoiceItem,
      manuscript,
      publishInvoiceCreatedUsecase,
      schedulingService,
      env.scheduler.confirmationReminderDelay,
      env.scheduler.emailRemindersQueue,
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
      loggerService,
      commsEmailService
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
      publishInvoiceCredited,
      loggerService
    );

    new AfterInvoiceMovedToPending(loggerService, emailService);

    new AfterJournalAPCUpdated(
      catalog,
      publishJournalAPCUpdated,
      loggerService
    );
  }
};
