import { Context } from '../context';

import { AfterInvoiceActivated } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoiceActivatedEvent';
import { AfterInvoicePaidEvent } from '../../../../libs/shared/src/lib/modules/invoices/subscriptions/AfterInvoicePaidEvents';
import { PublishInvoiceConfirmed } from 'libs/shared/src/lib/modules/invoices/usecases/publishInvoiceConfirmed';
import { PublishInvoicePaid } from 'libs/shared/src/lib/modules/invoices/usecases/PublishInvoicePaid/publishInvoicePaid';
import { SQSPublishServiceContract } from 'libs/shared/src/lib/domain/services/SQSPublishService';

export const registerDomainEvents = (
  context: Context,
  queue: SQSPublishServiceContract
) => {
  const {
    repos: { invoice, payer, invoiceItem, manuscript, payment, paymentMethod }
  } = context;
  const publishInvoiceActivated = new PublishInvoiceConfirmed(queue);
  const publishInvoicePaid = new PublishInvoicePaid(queue);

  // Registering Invoice Events
  new AfterInvoiceActivated(
    invoiceItem,
    payer,
    manuscript,
    publishInvoiceActivated
  );
  new AfterInvoicePaidEvent(
    invoice,
    invoiceItem,
    payer,
    manuscript,
    payment,
    paymentMethod,
    publishInvoicePaid
  );

  return;
};
