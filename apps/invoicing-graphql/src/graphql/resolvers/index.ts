import { merge } from 'lodash';
import { Resolvers } from '../schema';

import { payer } from './payer';
import { invoice } from './invoice';
import { coupon } from './coupon';
import { payments } from './payments';
import { transactions } from './transactions';
import { journals } from './journals';
import { migrateEntireInvoice } from './migrateEntireInvoice';
import { generateCompensatoryEvents } from './generateCompensatoryEvents';
import { reminders } from './reminders';
import { generateMissingReminderJobs } from './generateMissingReminderJobs';

export const resolvers: Resolvers<any> = merge(
  {},
  payer,
  invoice,
  coupon,
  payments,
  transactions,
  journals,
  migrateEntireInvoice,
  generateCompensatoryEvents,
  reminders,
  generateMissingReminderJobs
);
