import { SisifJobTypes, JobData } from '@hindawi/sisif';

import { Logger } from '../../lib/logger';

import { invoiceConfirmHandler } from './InvoiceConfirmReminder';
import { emptyHandler } from './EmptyHandler';

type SisifHandler = (payload: JobData, appContext: any, logger: Logger) => void;

type SisifHandlersRepo = {
  [key in SisifJobTypes & 'default']: SisifHandler;
};

const Handlers: SisifHandlersRepo = {
  [SisifJobTypes.InvoiceConfirmReminder]: invoiceConfirmHandler,
  [SisifJobTypes.SanctionedCountryNotification]: emptyHandler,
  [SisifJobTypes.InvoiceCreatedNotification]: emptyHandler,
  [SisifJobTypes.InvoicePaymentReminder]: emptyHandler,
  default: emptyHandler
};

export class SisifHandlers {
  static get(type: string): SisifHandler {
    return Handlers[type] || Handlers['default'];
  }
}
