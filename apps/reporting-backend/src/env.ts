// TODO move to shared lib
import 'config';

import * as pkg from '../../../package.json';
import {
  getOsEnv,
  getOsEnvOptional,
  getOsPath,
  normalizePort,
  toBool,
  toNumber,
} from './lib/env';

const everyDayCron = '0 0 * * *';
const everySatAnd1stOfMonthCron = '0 14 1 * sat';
const isRestEnabled = toBool(getOsEnvOptional('REST_ENABLED') || 'false');
export const env = {
  node: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
  app: {
    name: getOsEnv('SERVICE_NAME'),
    version: (pkg as any).version,
    description: (pkg as any).description,
    eventNamespace: getOsEnv('EVENT_NAMESPACE'),
    publisherName: getOsEnv('PUBLISHER_NAME'),
    port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
    viewRefreshCron: getOsEnvOptional('VIEW_CRON') || everyDayCron,
    acceptanceRatesCron:
      getOsEnvOptional('ACCEPTANCE_RATES_CRON') || everySatAnd1stOfMonthCron,
    dirs: {
      migrationsDir: getOsPath('DB_MIGRATIONS_DIR'),
    },
    batchSize: toNumber(getOsEnvOptional('BATCH_SIZE') || '100'),
    batchTimeout: toNumber(getOsEnvOptional('BATCH_TIMEOUT') || '10000'),
    isRestEnabled,
    restToken: isRestEnabled && getOsEnv('REST_TOKEN'),
  },
  log: {
    level: getOsEnv('LOG_LEVEL'),
    json: toBool(getOsEnvOptional('LOG_JSON')),
    output: getOsEnv('LOG_OUTPUT'),
  },
  db: {
    host: getOsEnvOptional('DB_HOST'),
    username: getOsEnvOptional('DB_USERNAME'),
    password: getOsEnvOptional('DB_PASSWORD'),
    database: getOsEnv('DB_DATABASE'),
    logging: getOsEnv('DB_LOGGING'),
  },
  aws: {
    region: getOsEnv('AWS_SNS_SQS_REGION'),
    sqs: {
      sqsSecretKey: getOsEnv('AWS_SNS_SQS_SECRET_KEY'),
      sqsAccessKey: getOsEnv('AWS_SNS_SQS_ACCESS_KEY'),
      disabled: toBool(getOsEnvOptional('AWS_SQS_DISABLED')),
      queueName: getOsEnv('AWS_SQS_QUEUE_NAME'),
      endpoint: getOsEnv('AWS_SQS_ENDPOINT'),
    },
  },
};
