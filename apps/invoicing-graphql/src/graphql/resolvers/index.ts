import { merge } from 'lodash';
import { Resolvers } from '../schema';
import { Context } from '../../context';

import { payer } from './payer';
import { invoice } from './invoice';
import { payments } from './payments';

export const resolvers: Resolvers<Context> = merge(
  {},
  payer,
  invoice,
  payments
);
