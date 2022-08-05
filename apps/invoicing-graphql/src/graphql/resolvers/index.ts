import { merge } from 'lodash';

import { Context } from '../../builders';
import { Resolvers } from '../schema';

import { generateInvoiceDraftCompensatoryEvents } from './generateInvoiceDraftCompensatoryEvents';
import { generateCreditNoteCompensatoryEvents } from './generateCreditNoteCompensatoryEvents';
import { generateInvoiceCompensatoryEvents } from './generateInvoiceCompensatoryEvents';
import { invoicingJournals } from './journals';
import { creditNote } from './creditNote';
import { publisher } from './publishers';
import { reminders } from './reminders';
import { payments } from './payments';
import { invoice } from './invoice';
import { coupon } from './coupon';
import { audit } from './audit';
import { payer } from './payer';

export const resolvers: Resolvers<Context> = merge(
  {},
  payer,
  creditNote,
  invoice,
  coupon,
  payments,
  invoicingJournals,
  publisher,
  reminders,
  audit,
  generateInvoiceDraftCompensatoryEvents,
  generateCreditNoteCompensatoryEvents,
  generateInvoiceCompensatoryEvents
);
