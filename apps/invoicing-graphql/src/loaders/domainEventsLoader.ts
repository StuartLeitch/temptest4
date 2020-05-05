/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable max-len */

import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';

import { AfterInvoiceCreatedEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceCreatedEvents';
import { AfterInvoiceConfirmed } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/afterInvoiceConfirmedEvent';
import { AfterInvoiceFinalized } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceFinalizedEvent';
import { AfterInvoicePaidEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoicePaidEvents';
import { AfterInvoiceCreditNoteCreatedEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceCreditNoteCreatedEvents';
import { PublishInvoiceConfirmed } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishInvoiceConfirmed';
import { PublishInvoiceFinalized } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishInvoiceFinalized';
import { PublishInvoicePaid } from '../../../../libs/shared/src/lib/modules/invoices/usecases/PublishInvoicePaid/publishInvoicePaid';
import { PublishInvoiceCredited } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishInvoiceCredited/publishInvoiceCredited';
import { PublishInvoiceToErpUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishInvoiceToErp/publishInvoiceToErp';
import { PublishInvoiceCreatedUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishInvoiceCreated/publishInvoiceCreated';
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
        invoice,
        invoiceItem,
        manuscript,
        payer,
        address,
        catalog,
        coupon,
        waiver,
        publisher,
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
    const publishInvoiceConfirmed = new PublishInvoiceConfirmed(queue);
    const publishInvoiceFinalized = new PublishInvoiceFinalized(queue);
    const publishInvoicePaid = new PublishInvoicePaid(queue);
    const publishInvoiceCredited = new PublishInvoiceCredited(queue);

    // Registering Invoice Events
    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceCreatedEvent(
      invoice,
      invoiceItem,
      manuscript,
      publishInvoiceCreatedUsecase
    );

    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceCreditNoteCreatedEvent(
      invoice,
      invoiceItem,
      coupon,
      waiver,
      payer,
      manuscript,
      address,
      publishInvoiceCredited
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
      invoiceItem,
      coupon,
      waiver,
      payer,
      address,
      manuscript,
      publishInvoiceFinalized,
      loggerService
    );

    // tslint:disable-next-line: no-unused-expression
    new AfterInvoicePaidEvent(
      invoice,
      invoiceItem,
      coupon,
      waiver,
      manuscript,
      payer,
      publishInvoicePaid,
      loggerService
    );

    // tslint:disable-next-line: no-unused-expression
    // new AfterManuscriptPublishedEvent(logger, manuscript);
  }
};
