import { getOsEnvOptional, nonEmptyOsEnv, getOsEnv, toBool } from './lib/env';

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
    netsuiteLoader: toBool(getOsEnvOptional('NETSUITE_LOADER_ENABLED')),
    queueLoader: toBool(getOsEnvOptional('QUEUE_LOADER_ENABLED')),
  },
  log: {
    level: getOsEnv('LOG_LEVEL'),
  },
  // aws: {
  //   enabled: toBool(getOsEnv('AWS_ENABLED')),
  //   ses: {
  //     region: getOsEnv('AWS_SES_REGION'),
  //     accessKey: getOsEnv('AWS_SES_ACCESS_KEY'),
  //     secretKey: getOsEnv('AWS_SES_SECRET_KEY'),
  //   },
  //   sns: {
  //     topic: getOsEnv('AWS_SNS_TOPIC'),
  //     endpoint: getOsEnv('AWS_SNS_ENDPOINT'),
  //     sqsRegion: getOsEnv('AWS_SNS_SQS_REGION'),
  //     sqsAccessKey: getOsEnv('AWS_SNS_SQS_ACCESS_KEY'),
  //     sqsSecretKey: getOsEnv('AWS_SNS_SQS_SECRET_KEY'),
  //   },
  //   sqs: {
  //     queueName: getOsEnv('AWS_SQS_QUEUE_NAME'),
  //     endpoint: getOsEnv('AWS_SQS_ENDPOINT'),
  //   },
  //   s3: {
  //     endpoint: getOsEnvOptional('AWS_S3_ENDPOINT'),
  //     largeEventBucket: getOsEnv('PHENOM_LARGE_EVENTS_BUCKET'),
  //     bucketPrefix: getOsEnv('PHENOM_LARGE_EVENTS_PREFIX'),
  //   },
  // },
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
  },
  erpIntegration: {
    awsSQSRegion: getOsEnv('ERP_AWS_SQS_REGION'),
    awsSQSEndpoint: getOsEnv('ERP_AWS_SQS_ENDPOINT'),
    awsSQSQueueName: getOsEnv('ERP_AWS_SQS_QUEUE_NAME'),
  },
};
