import { SisifJobTypes, JobData } from '@hindawi/sisif';
import { LoggerContract } from '@hindawi/shared';

import { invoiceCreditControlHandler } from './InvoiceCreditControlReminder';
import { invoiceConfirmHandler } from './InvoiceConfirmReminder';
import { invoicePaymentHandler } from './InvoicePaymentReminder';
import { emptyHandler } from './EmptyHandler';

type SisifHandler = (
  payload: JobData,
  appContext: any,
  logger: LoggerContract
) => void;

type SisifHandlersRepo = {
  [key in SisifJobTypes & 'default']: SisifHandler;
};

const Handlers: SisifHandlersRepo = {
  [SisifJobTypes.InvoiceCreditControlReminder]: invoiceCreditControlHandler,
  [SisifJobTypes.InvoiceConfirmReminder]: invoiceConfirmHandler,
  [SisifJobTypes.InvoicePaymentReminder]: invoicePaymentHandler,
  [SisifJobTypes.SanctionedCountryNotification]: emptyHandler,
  [SisifJobTypes.InvoiceCreatedNotification]: emptyHandler,
  default: emptyHandler
};

export class SisifHandlers {
  static get(type: string): SisifHandler {
    return Handlers[type] || Handlers['default'];
  }
}
