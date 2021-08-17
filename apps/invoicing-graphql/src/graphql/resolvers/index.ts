import { merge } from 'lodash';
import { Resolvers } from '../schema';

import { Context } from '../../builders';

import { payer } from './payer';
import { invoice } from './invoice';
import { coupon } from './coupon';
import { payments } from './payments';
import { journals } from './journals';
import { generateCompensatoryEvents } from './generateCompensatoryEvents';
import { reminders } from './reminders';
import { generateDraftCompensatoryEvents } from './generateDraftCompensatoryEvents';
import { audit } from './audit';

export const resolvers: Resolvers<Context> = merge(
  {},
  payer,
  invoice,
  coupon,
  payments,
  journals,
  generateCompensatoryEvents,
  reminders,
  generateDraftCompensatoryEvents,
  audit
);
