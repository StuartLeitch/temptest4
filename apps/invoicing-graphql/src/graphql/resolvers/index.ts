import { merge } from 'lodash';
import { Resolvers } from '../schema';

import { payer } from './payer';
import { invoice } from './invoice';
import { payments } from './payments';
import { transactions } from './transactions';
import { journals } from './journals';
import { migrateEntireInvoice } from './migrateEntireInvoice';

export const resolvers: Resolvers<any> = merge(
  {},
  payer,
  invoice,
  payments,
  transactions,
  journals,
  migrateEntireInvoice
);
