import { Context } from '../../builders';
import { Resolvers } from '../schema';
import { merge } from 'lodash';

import { s3Upload } from './S3Upload';

export const resolvers: Resolvers<Context> = merge(
  {},
  s3Upload
);
