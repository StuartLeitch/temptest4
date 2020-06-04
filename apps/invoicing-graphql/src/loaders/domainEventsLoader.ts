/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable max-len */

import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';

import { PublishInvoiceCreditedUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishEvents/publishInvoiceCredited/publishInvoiceCredited';
import { PublishInvoiceCreatedUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishEvents/publishInvoiceCreated/publishInvoiceCreated';
import { PublishInvoiceConfirmedUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishEvents/publishInvoiceConfirmed';
import { PublishInvoiceFinalizedUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishEvents/publishInvoiceFinalized';
import { PublishInvoiceToErpUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishInvoiceToErp/publishInvoiceToErp';
import { PublishInvoicePaidUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishEvents/publishInvoicePaid';

import { AfterInvoiceCreditNoteCreatedEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceCreditNoteCreatedEvents';
import { AfterInvoiceCreatedEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceCreatedEvents';
import { AfterInvoiceConfirmed } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/afterInvoiceConfirmedEvent';
import { AfterInvoiceFinalized } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceFinalizedEvent';
import { AfterInvoicePaidEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoicePaidEvents';
// import { AfterManuscriptPublishedEvent } from '../../../../libs/shared/src/lib/modules/manuscripts/subscriptions/AfterManuscriptPublishedEvent';

import { env } from '../env';
import { Logger } from '../lib/logger';

// This feature is a copy from https://github.com/kadirahq/graphql-errors
const logger = new Logger('domain:events');

export const domainEventsRegisterLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context = settings.getData('context');
    const {
      repos: {
        paymentMethod,
        invoiceItem,
        manuscript,
        publisher,
        address,
        catalog,
        invoice,
        payment,
        coupon,
        waiver,
        payer,
      },
      services: { erpService, logger: loggerService, schedulingService },
      qq: queue,
    } = context;

    const publishInvoiceToErpUsecase = new PublishInvoiceToErpUsecase(
      invoice,
      invoiceItem,
      coupon,
      waiver,
      payer,
      address,
      manuscript,
      catalog,
      erpService,
      publisher,
      loggerService
    );

    const publishInvoiceCreatedUsecase = new PublishInvoiceCreatedUsecase(
      queue
    );
    const publishInvoiceConfirmed = new PublishInvoiceConfirmedUsecase(queue);
    const publishInvoiceFinalized = new PublishInvoiceFinalizedUsecase(queue);
    const publishInvoiceCredited = new PublishInvoiceCreditedUsecase(queue);
    const publishInvoicePaid = new PublishInvoicePaidUsecase(queue);

    // Registering Invoice Events
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
      publishInvoiceToErpUsecase,
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
    // new AfterManuscriptPublishedEvent(logger, manuscript);
  }
};
