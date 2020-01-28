// TODO move to shared lib
import 'config';

import * as pkg from '../../../package.json';
import {
  getOsEnvOptional,
  normalizePort,
  getOsEnv,
  toNumber,
  toBool
} from './lib/env';

export const env = {
  node: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
  app: {
    name: getOsEnv('SERVICE_NAME'),
    version: (pkg as any).version,
    description: (pkg as any).description,
    port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
    batchSize: toNumber(getOsEnvOptional('BATCH_SIZE') || '100'),
    batchTimeout: toNumber(getOsEnvOptional('BATCH_TIMEOUT') || '10000')
  },
  log: {
    level: getOsEnv('LOG_LEVEL'),
    json: toBool(getOsEnvOptional('LOG_JSON')),
    output: getOsEnv('LOG_OUTPUT')
  },
  aws: {
    sqs: {
      apiVersion: getOsEnv('AWS_SQS_API_VERSION'),
      accessKey: getOsEnv('AWS_SQS_ACCESS_KEY'),
      secretKey: getOsEnv('AWS_SQS_SECRET_KEY'),
      queueName: getOsEnv('AWS_SQS_QUEUE_NAME'),
      region: getOsEnv('AWS_SQS_REGION')
    },
    s3: {
      apiVersion: getOsEnv('AWS_S3_API_VERSION'),
      bucketName: getOsEnv('AWS_S3_BUCKET_NAME'),
      accessKey: getOsEnv('AWS_S3_ACCESS_KEY'),
      secretKey: getOsEnv('AWS_S3_SECRET_KEY'),
      region: getOsEnv('AWS_S3_REGION')
    }
  }
};
