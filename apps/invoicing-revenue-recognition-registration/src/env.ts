import * as pkg from '../../../package.json';
import {
  getOsEnvOptional,
  nonEmptyOsEnv,
  normalizePort,
  getOsPath,
  getOsEnv,
  toFloat,
  toBool,
  toObject,
} from './lib/env';

export const env = {
  node: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'qa',
  app: {
    name: getOsEnv('SERVICE_NAME'),
    version: (pkg as any).version,
    description: (pkg as any).description,
    schema: getOsEnv('APP_SCHEMA'),
    host: getOsEnv('APP_HOST'),
    port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
    routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
    FERoot: getOsEnv('FE_ROOT'),
    eventNamespace: getOsEnv('EVENT_NAMESPACE'),
    publisherName: getOsEnv('PUBLISHER_NAME'),
    defaultMessageAttributes: getOsEnv('DEFAULT_MESSAGE_ATTRIBUTES'),
    vatValidationServiceEndpoint: getOsEnv('VAT_VALIDATION_SERVICE_ENDPOINT'),
    failedErpCronRetryTimeMinutes: toFloat(
      getOsEnv('FAILED_ERP_CRON_RETRY_TIME_MINUTES')
    ),
    failedErpCronRetryDisabled: toBool(
      getOsEnv('FAILED_ERP_CRON_RETRY_DISABLED')
    ),
    skippingSeeding: toBool(getOsEnv('SKIPPING_SEEDING')),
    mailingDisabled: toBool(getOsEnv('MAILING_DISABLED')),
    banner: toBool(getOsEnv('APP_BANNER')),
    tenantName: getOsEnv('TENANT_NAME'),
    tenantAddress: getOsEnv('TENANT_ADDRESS'),
    tenantCountry: getOsEnv('TENANT_COUNTRY'),
    logoUrl: getOsEnv('LOGO_URL'),
    dirs: {
      migrationsDir: getOsPath('DB_MIGRATIONS_DIR'),
      seedsDir: getOsPath('DB_SEEDS_DIR'),
    },
    sanctionedCountryNotificationReceiver: getOsEnv(
      'SANCTIONED_COUNTRY_NOTIFICATION_RECEIVER'
    ),
    sanctionedCountryNotificationSender: getOsEnv(
      'SANCTIONED_COUNTRY_NOTIFICATION_SENDER'
    ),
    invoicePaymentEmailBankTransferCopyReceiver: getOsEnv(
      'INVOICE_PAYMENT_EMAIL_BANK_TRANSFER_COPY_RECEIVER'
    ),
    invoicePaymentEmailSenderAddress: getOsEnv(
      'INVOICE_PAYMENT_EMAIL_SENDER_ADDRESS'
    ),
    invoicePaymentEmailSenderName: getOsEnv(
      'INVOICE_PAYMENT_EMAIL_SENDER_NAME'
    ),
    creditControlReminderSenderEmail: getOsEnv(
      'CREDIT_CONTROL_REMINDER_SENDER_EMAIL'
    ),
    creditControlReminderSenderName: getOsEnv(
      'CREDIT_CONTROL_REMINDER_SENDER_NAME'
    ),
    assistanceEmail: getOsEnv('ASSISTANCE_EMAIL'),
    doiNumber: getOsEnv('DOI_NUMBER'),
    keycloakConfig: toObject(getOsEnv('KEYCLOAK_CONFIG')),
    sessionSecret: getOsEnv('SESSION_SECRET'),
  },
  loaders: {
    knexEnabled: toBool(getOsEnvOptional('KNEX_LOADER_ENABLED')),
    contextEnabled: toBool(getOsEnvOptional('CONTEXT_LOADER_ENABLED')),
    expressEnabled: toBool(getOsEnvOptional('EXPRESS_LOADER_ENABLED')),
    monitorEnabled: toBool(getOsEnvOptional('MONITOR_LOADER_ENABLED')),
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
    enabled: toBool(getOsEnv('AWS_ENABLED')),
    ses: {
      region: getOsEnv('AWS_SES_REGION'),
      accessKey: getOsEnv('AWS_SES_ACCESS_KEY'),
      secretKey: getOsEnv('AWS_SES_SECRET_KEY'),
    },
    sns: {
      topic: getOsEnv('AWS_SNS_TOPIC'),
      endpoint: getOsEnv('AWS_SNS_ENDPOINT'),
      sqsRegion: getOsEnv('AWS_SNS_SQS_REGION'),
      sqsAccessKey: getOsEnv('AWS_SNS_SQS_ACCESS_KEY'),
      sqsSecretKey: getOsEnv('AWS_SNS_SQS_SECRET_KEY'),
    },
    sqs: {
      queueName: getOsEnv('AWS_SQS_QUEUE_NAME'),
      endpoint: getOsEnv('AWS_SQS_ENDPOINT'),
    },
    s3: {
      endpoint: getOsEnvOptional('AWS_S3_ENDPOINT'),
      largeEventBucket: getOsEnv('PHENOM_LARGE_EVENTS_BUCKET'),
      bucketPrefix: getOsEnv('PHENOM_LARGE_EVENTS_PREFIX'),
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
