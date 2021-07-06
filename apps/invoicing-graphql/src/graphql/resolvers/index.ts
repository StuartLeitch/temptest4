import { merge } from 'lodash';
import { Resolvers } from '../schema';

import { Context } from '../../builders';

import { payer } from './payer';
import { creditNote } from './creditNote';
import { invoice } from './invoice';
import { coupon } from './coupon';
import { payments } from './payments';
import { transactions } from './transactions';
import { journals } from './journals';
import { migrateEntireInvoice } from './migrateEntireInvoice';
import { generateCompensatoryEvents } from './generateCompensatoryEvents';
import { reminders } from './reminders';
import { generateMissingReminderJobs } from './generateMissingReminderJobs';
import { generateDraftCompensatoryEvents } from './generateDraftCompensatoryEvents';

export const resolvers: Resolvers<Context> = merge(
  {},
  payer,
  creditNote,
  invoice,
  coupon,
  payments,
  transactions,
  journals,
  migrateEntireInvoice,
  generateCompensatoryEvents,
  reminders,
  generateMissingReminderJobs,
  generateDraftCompensatoryEvents
);
