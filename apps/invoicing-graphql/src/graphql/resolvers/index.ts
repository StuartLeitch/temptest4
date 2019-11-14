import { merge } from 'lodash';
import { Resolvers } from '../schema';
import { Context } from '../../context';

import { invoice } from './invoice';
import { payerResolvers } from './payer';
import { payments } from './payments';

export const resolvers: Resolvers<Context> = merge(
  {},
  invoice,
  payerResolvers,
  payments
);
