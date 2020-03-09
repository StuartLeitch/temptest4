import { JobData } from '@hindawi/sisif';

import { SisifJobTypes } from '../JobTypes';

import { invoiceConfirmHandler } from './InvoiceConfirmReminder';
import { emptyHandler } from './EmptyHandler';

type SisifHandler = (payload: JobData, appContext: any) => void;

type SisifHandlersRepo = {
  [key in SisifJobTypes & 'default']: SisifHandler;
};

export const SisifHandlers: SisifHandlersRepo = {
  [SisifJobTypes.InvoiceConfirmReminder]: invoiceConfirmHandler,
  [SisifJobTypes.SanctionedCountryNotification]: emptyHandler,
  [SisifJobTypes.InvoiceCreatedNotification]: emptyHandler,
  [SisifJobTypes.InvoicePaymentReminder]: emptyHandler,
  default: emptyHandler
};
