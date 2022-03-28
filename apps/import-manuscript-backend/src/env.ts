import * as pkg from '../../../package.json';

import {
  getOsEnvOptionalIfOtherExists,
  getOsEnvOptional,
  normalizePort,
  getOsPath,
  getOsEnv,
  toObject,
  toBool,
} from '@hindawi/env-utils';

export const env = {
  node: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'qa',
  app: {
    name: getOsEnv('IMPORT_MANUSCRIPT_BACKEND_SERVICE_NAME'),
    version: pkg.version,
    description: pkg.description,
    schema: getOsEnv('APP_SCHEMA'),
    host: getOsEnv('APP_HOST'),
    port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
    routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
    skippingSeeding: toBool(getOsEnv('SKIPPING_SEEDING')),
    banner: toBool(getOsEnv('APP_BANNER')),
    dirs: {
      migrationsDir: getOsPath('IMPORT_MANUSCRIPT_DB_MIGRATIONS_DIR'),
      seedsDir: getOsPath('IMPORT_MANUSCRIPT_DB_SEEDS_DIR'),
    },
    keycloakConfig: toObject(getOsEnv('IMPORT_MANUSCRIPT_KEYCLOAK_CONFIG')),
    keycloakClientId: getOsEnv('IMPORT_MANUSCRIPT_KEYCLOAK_CLIENT_ID'),
    sessionSecret: getOsEnv('SESSION_SECRET'),
  },
  log: {
    level: getOsEnv('LOG_LEVEL'),
  },
  db: {
    host: getOsEnvOptional('IMPORT_MANUSCRIPT_DB_HOST'),
    username: getOsEnvOptional('IMPORT_MANUSCRIPT_DB_USERNAME'),
    password: getOsEnvOptional('IMPORT_MANUSCRIPT_DB_PASSWORD'),
    database: getOsEnv('IMPORT_MANUSCRIPT_DB_DATABASE'),
    logQueries: toBool(getOsEnv('IMPORT_MANUSCRIPT_DB_LOG_QUERIES')),
  },
  graphql: {
    enabled: toBool(getOsEnv('GRAPHQL_ENABLED')),
    route: getOsEnv('GRAPHQL_ROUTE'),
    editor: toBool(getOsEnv('GRAPHQL_EDITOR')),
  },
  aws: {
    awsProfile: getOsEnvOptional('AWS_PROFILE'),
    region: getOsEnv('IMPORT_MANUSCRIPT_AWS_REGION'),
    accessKey: getOsEnvOptionalIfOtherExists(
      'IMPORT_MANUSCRIPT_AWS_ACCESS_KEY',
      'AWS_PROFILE'
    ),
    secretKey: getOsEnvOptionalIfOtherExists(
      'IMPORT_MANUSCRIPT_AWS_SECRET_KEY',
      'AWS_PROFILE'
    ),
    sqs: {
      queueName: getOsEnv('IMPORT_MANUSCRIPT_AWS_SQS_QUEUE_NAME'),
      endpoint: getOsEnvOptional('IMPORT_MANUSCRIPT_AWS_SQS_ENDPOINT'),
      eventNamespace: getOsEnv('IMPORT_MANUSCRIPT_AWS_SQS_EVENT_NAMESPACE'),
      publisherName: getOsEnv('IMPORT_MANUSCRIPT_AWS_SQS_PUBLISHER_NAME'),
    },
    s3: {
      endpoint: getOsEnvOptional('IMPORT_MANUSCRIPT_AWS_S3_ENDPOINT'),
      zipBucket: getOsEnv('IMPORT_MANUSCRIPT_AWS_S3_ZIP_BUCKET'),
      signedUrlExpirationInSeconds: getOsEnv(
        'IMPORT_MANUSCRIPT_AWS_S3_SIGNED_URL_EXPIRATION_IN_SEC'
      ),
    },
  },
};
