import { merge } from 'lodash';

import { Context } from '../../builders';
import { Resolvers } from '../schema';

import { generateInvoiceDraftCompensatoryEvents } from './generateInvoiceDraftCompensatoryEvents';
import { generateCreditNoteCompensatoryEvents } from './generateCreditNoteCompensatoryEvents';
import { generateInvoiceCompensatoryEvents } from './generateInvoiceCompensatoryEvents';
import { creditNote } from './creditNote';
import { reminders } from './reminders';
import { journals } from './journals';
import { payments } from './payments';
import { invoice } from './invoice';
import { coupon } from './coupon';
import { payer } from './payer';

export const resolvers: Resolvers<Context> = merge(
  {},
  payer,
  creditNote,
  invoice,
  coupon,
  payments,
  journals,
  generateInvoiceCompensatoryEvents,
  reminders,
  generateInvoiceDraftCompensatoryEvents,
  generateCreditNoteCompensatoryEvents
);
