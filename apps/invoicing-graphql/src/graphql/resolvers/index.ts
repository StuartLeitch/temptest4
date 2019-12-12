import { merge } from 'lodash';
import { Resolvers } from '../schema';

import { payer } from './payer';
import { invoice } from './invoice';
import { payments } from './payments';
import { transactions } from './transactions';

export const resolvers: Resolvers<any> = merge(
  {},
  payer,
  invoice,
  payments,
  transactions
);
