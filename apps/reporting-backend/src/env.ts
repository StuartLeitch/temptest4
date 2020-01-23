// TODO move to shared lib
import 'config';

import * as pkg from '../../../package.json';
import {
  getOsEnv,
  getOsEnvOptional,
  getOsPath,
  normalizePort,
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
    eventNamespace: getOsEnv('EVENT_NAMESPACE'),
    publisherName: getOsEnv('PUBLISHER_NAME'),
    port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
    dirs: {
      migrationsDir: getOsPath('DB_MIGRATIONS_DIR'),
      seedsDir: getOsPath('DB_SEEDS_DIR')
    }
  },
  log: {
    level: getOsEnv('LOG_LEVEL'),
    json: toBool(getOsEnvOptional('LOG_JSON')),
    output: getOsEnv('LOG_OUTPUT')
  },
  db: {
    host: getOsEnvOptional('DB_HOST'),
    username: getOsEnvOptional('DB_USERNAME'),
    password: getOsEnvOptional('DB_PASSWORD'),
    database: getOsEnv('DB_DATABASE'),
    logging: getOsEnv('DB_LOGGING')
  },
  aws: {
    sns: {
      topic: getOsEnv('AWS_SNS_TOPIC'),
      endpoint: getOsEnv('AWS_SNS_ENDPOINT'),
      sqsRegion: getOsEnv('AWS_SNS_SQS_REGION'),
      sqsAccessKey: getOsEnv('AWS_SNS_SQS_ACCESS_KEY'),
      sqsSecretKey: getOsEnv('AWS_SNS_SQS_SECRET_KEY')
    },
    sqs: {
      queueName: getOsEnv('AWS_SQS_QUEUE_NAME'),
      endpoint: getOsEnv('AWS_SQS_ENDPOINT')
    },
    s3: {
      apiVersion: getOsEnv('AWS_S3_API_VERSION'),
      accessKey: getOsEnv('AWS_S3_ACCESS_KEY'),
      secretKey: getOsEnv('AWS_S3_SECRET_KEY'),
      endpoint: getOsEnv('AWS_S3_ENDPOINT')
    }
  }
};
