// TODO move to shared lib
import 'config';

import * as pkg from '../../../package.json';
import {
  getOsEnvOptional,
  normalizePort,
  getOsEnv,
  toNumber,
  toBool,
} from './lib/env';
import { ConsumerTransport } from './contants';

const consumerTransport: ConsumerTransport =
  (getOsEnvOptional('CONSUMER_TRANSPORT') as ConsumerTransport) ||
  ConsumerTransport.SQS;

export const env = {
  node: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
  consumerTransport,
  app: {
    name: getOsEnv('SERVICE_NAME'),
    version: (pkg as any).version,
    description: (pkg as any).description,
    port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
    batchSize: toNumber(getOsEnvOptional('BATCH_SIZE') || '100'),
    batchTimeout: toNumber(getOsEnvOptional('BATCH_TIMEOUT') || '10000'),
    resumeDir: getOsEnvOptional('RESUME_DIR') || '/tmp',
  },
  log: {
    level: getOsEnv('LOG_LEVEL'),
    json: toBool(getOsEnvOptional('LOG_JSON')),
    output: getOsEnv('LOG_OUTPUT'),
  },
  aws: {
    sqs: consumerTransport === ConsumerTransport.SQS && {
      apiVersion: getOsEnv('AWS_SQS_API_VERSION'),
      accessKey: getOsEnv('AWS_SQS_ACCESS_KEY'),
      secretKey: getOsEnv('AWS_SQS_SECRET_KEY'),
      queueName: getOsEnv('AWS_SQS_QUEUE_NAME'),
      region: getOsEnv('AWS_SQS_REGION'),
    },
    s3: {
      apiVersion: getOsEnv('AWS_S3_API_VERSION'),
      bucketName: getOsEnv('AWS_S3_BUCKET_NAME'),
      accessKey: getOsEnv('AWS_S3_ACCESS_KEY'),
      secretKey: getOsEnv('AWS_S3_SECRET_KEY'),
      region: getOsEnv('AWS_S3_REGION'),
    },
  },
  consumerHttp: consumerTransport === ConsumerTransport.HTTP && {
    host: getOsEnv('CONSUMER_HOST'),
    token: getOsEnv('CONSUMER_TOKEN'),
  },
  db: consumerTransport === ConsumerTransport.POSTGRES && {
    host: getOsEnvOptional('DB_HOST'),
    username: getOsEnvOptional('DB_USERNAME'),
    password: getOsEnvOptional('DB_PASSWORD'),
    database: getOsEnv('DB_DATABASE'),
  },
  workerCount: toNumber(getOsEnvOptional('WORKER_COUNT') || '1'),
};
