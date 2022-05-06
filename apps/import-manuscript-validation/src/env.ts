import * as pkg from '../../../package.json';

import {
  getOsEnvOptionalIfOtherExists,
  getOsEnvOptional,
  getOsEnv,
  toBool, toObject,
} from '@hindawi/env-utils';

export const env = {
  node: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'qa',
  app: {
    name: getOsEnv('IMPORT_MANUSCRIPT_VALIDATION_SERVICE_NAME'),
    version: pkg.version,
    description: pkg.description,
    banner: toBool(getOsEnv('APP_BANNER')),
    xmlDefinitionsLocation: getOsEnv('IMPORT_MANUSCRIPT_XML_DEFINITION_PATH'),
    submissionGraphqlEndpoint: getOsEnv('IMPORT_MANUSCRIPT_SUBMISSION_GRAPHQL'),
    submissionAdminUsername: getOsEnv('IMPORT_MANUSCRIPT_SUBMISSION_ADMIN_USERNAME'),
    submissionAdminPassword: getOsEnv('IMPORT_MANUSCRIPT_SUBMISSION_ADMIN_PASSWORD'),
    submissionKeycloakConfig: toObject(getOsEnv('IMPORT_MANUSCRIPT_SUBMISSION_KEYCLOAK_CONFIG')),
    submissionKeycloakClientId: getOsEnv('IMPORT_MANUSCRIPT_SUBMISSION_KEYCLOAK_CLIENT_ID'),
  },
  log: {
    level: getOsEnv('LOG_LEVEL'),
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
      jobQueue: getOsEnvOptional('IMPORT_MANUSCRIPT_AWS_SQS_QUEUE_NAME'),
      endpoint: getOsEnv('IMPORT_MANUSCRIPT_AWS_SQS_ENDPOINT'),
    },
    s3: {
      endpoint: getOsEnvOptional('IMPORT_MANUSCRIPT_AWS_S3_ENDPOINT'),
      zipBucket: getOsEnv('IMPORT_MANUSCRIPT_AWS_S3_ZIP_BUCKET'),
    },
    ses: {
      accessKey: getOsEnvOptional('IMPORT_MANUSCRIPT_AWS_SES_ACCESS_KEY'),
      secretKey: getOsEnv('IMPORT_MANUSCRIPT_AWS_SES_SECRET_KEY'),
    },
  },
  zip: {
    saveLocation: getOsEnv('IMPORT_MANUSCRIPT_ZIP_SAVE_LOCATION'),
  },
};
