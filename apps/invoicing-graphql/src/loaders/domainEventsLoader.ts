/* eslint-disable max-len */

import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';

import { AfterInvoiceCreatedEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceCreatedEvents';
import { AfterInvoiceActivated } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceActivatedEvent';
import { AfterInvoicePaidEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoicePaidEvents';
import { PublishInvoiceConfirmed } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishInvoiceConfirmed';
import { PublishInvoicePaid } from '../../../../libs/shared/src/lib/modules/invoices/usecases/PublishInvoicePaid/publishInvoicePaid';
import { PublishInvoiceToErpUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishInvoiceToErp/publishInvoiceToErp';
import { PublishInvoiceCreatedUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishInvoiceCreated/publishInvoiceCreated';

// import { env } from '../env';

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
        waiver
      },
      services: { erpService },
      qq: queue
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
      erpService
    );

    const publishInvoiceCreatedUsecase = new PublishInvoiceCreatedUsecase(
      queue
    );
    const publishInvoiceActivated = new PublishInvoiceConfirmed(queue);
    const publishInvoicePaid = new PublishInvoicePaid(queue);

    // Registering Invoice Events
    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceCreatedEvent(
      invoice,
      invoiceItem,
      manuscript,
      publishInvoiceCreatedUsecase
    );
    // tslint:disable-next-line: no-unused-expression
    new AfterInvoiceActivated(
      invoiceItem,
      coupon,
      waiver,
      payer,
      address,
      manuscript,
      publishInvoiceActivated,
      publishInvoiceToErpUsecase
    );
    // tslint:disable-next-line: no-unused-expression
    new AfterInvoicePaidEvent(
      invoice,
      invoiceItem,
      coupon,
      waiver,
      manuscript,
      publishInvoicePaid
    );
  }
};
