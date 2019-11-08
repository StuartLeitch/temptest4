import {merge} from 'lodash';
import {Resolvers} from '../schema';
import {Context} from '../../context';

import {echo} from './echo';
import {invoice} from './invoice';
import {payerResolvers} from './payer';

export const resolvers: Resolvers<Context> = merge({}, echo, invoice, payerResolvers);
