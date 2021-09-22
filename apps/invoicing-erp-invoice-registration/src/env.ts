import {
  getOsEnvOptional,
  nonEmptyOsEnv,
  getOsEnv,
  toBool,
  toObject,
} from '@hindawi/env-utils';

export const env = {
  node: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'qa',
  app: {
    name: getOsEnv('SERVICE_NAME'),
  },
  loaders: {
    knexEnabled: toBool(getOsEnvOptional('KNEX_LOADER_ENABLED')),
    contextEnabled: toBool(getOsEnvOptional('CONTEXT_LOADER_ENABLED')),
    queueServiceEnabled: toBool(
      getOsEnvOptional('QUEUE_SERVICE_LOADER_ENABLED')
    ),
    erpEnabled: toBool(getOsEnvOptional('ERP_LOADER_ENABLED')),
  },
  log: {
    level: getOsEnv('LOG_LEVEL'),
  },
  db: {
    host: getOsEnvOptional('DB_HOST'),
    username: getOsEnvOptional('DB_USERNAME'),
    password: getOsEnvOptional('DB_PASSWORD'),
    database: getOsEnv('DB_DATABASE'),
  },
  aws: {
    sqs: {
      sqsAccessKey: getOsEnv('AWS_SQS_ACCESS_KEY'),
      sqsSecretKey: getOsEnv('AWS_SQS_SECRET_KEY'),
      queueName: getOsEnv('AWS_SQS_QUEUE_NAME'),
      endpoint: getOsEnv('AWS_SQS_ENDPOINT'),
      sqsRegion: getOsEnv('AWS_SQS_REGION'),
    },
  },
  netSuite: {
    account: getOsEnv('NETSUITE_REALM'),
    endpoint: getOsEnv('NETSUITE_REST_ENDPOINT'),
    consumerKey: getOsEnv('NETSUITE_CONSUMER_KEY'),
    consumerSecret: getOsEnv('NETSUITE_CONSUMER_SECRET'),
    tokenId: getOsEnv('NETSUITE_TOKEN_ID'),
    tokenSecret: getOsEnv('NETSUITE_TOKEN_SECRET'),
    netSuiteEnabled: toBool(getOsEnv('NETSUITE_ENABLED')),
    customSegmentFieldName: nonEmptyOsEnv('NETSUITE_CUSTOM_SEGMENT_FIELD_NAME'),
    customExternalPaymentReference: nonEmptyOsEnv(
      'NETSUITE_CUSTOM_EXTERNAL_PAYMENT_REFERENCE'
    ),
    customUniquePaymentReference: nonEmptyOsEnv(
      'NETSUITE_CUSTOM_UNIQUE_PAYMENT_REFERENCE'
    ),
    netsuiteTaxDetailsUkStandard: toObject(
      nonEmptyOsEnv('NETSUITE_TAX_DETAILS_UK_STANDARD')
    ),
    netsuiteTaxDetailsUkZero: toObject(
      nonEmptyOsEnv('NETSUITE_TAX_DETAILS_UK_ZERO')
    ),
  },
};
