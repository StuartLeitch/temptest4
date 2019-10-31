import * as dotenv from 'dotenv';
import * as path from 'path';

// import * as pkg from '../../package.json';
import {
  getOsEnv,
  getOsEnvOptional,
  getOsPath,
  getOsPaths,
  normalizePort,
  toBool,
  toNumber
} from './utils';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config({
  path: path.join(
    process.cwd(),
    `.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`
  )
});

/**
 * Environment variables
 */
export const environment = {
  node: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
  app: {
    name: getOsEnv('APP_NAME'),
    version: '0.1.0',
    description: 'Invoicing GraphQL Server',
    host: getOsEnv('APP_HOST'),
    schema: getOsEnv('APP_SCHEMA'),
    routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
    port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
    banner: toBool(getOsEnv('APP_BANNER')),
    dirs: {
      migrations: getOsPaths('DB_MIGRATIONS'),
      migrationsDir: getOsPath('DB_MIGRATIONS_DIR'),
      entities: getOsPaths('DB_ENTITIES'),
      entitiesDir: getOsPath('DB_ENTITIES_DIR'),
      controllers: getOsPaths('CONTROLLERS'),
      middlewares: getOsPaths('MIDDLEWARES'),
      interceptors: getOsPaths('INTERCEPTORS'),
      subscribers: getOsPaths('SUBSCRIBERS'),
      resolvers: getOsPaths('RESOLVERS')
    }
  },
  log: {
    level: getOsEnv('LOG_LEVEL'),
    json: toBool(getOsEnvOptional('LOG_JSON')),
    output: getOsEnv('LOG_OUTPUT')
  },
  db: {
    type: getOsEnv('DB_CONNECTION'),
    host: getOsEnvOptional('DB_HOST'),
    port: toNumber(getOsEnvOptional('DB_PORT')),
    username: getOsEnvOptional('DB_USERNAME'),
    password: getOsEnvOptional('DB_PASSWORD'), // zWyEjpFhSk
    database: getOsEnv('DB_DATABASE'),
    synchronize: toBool(getOsEnvOptional('DB_SYNCHRONIZE')),
    logging: getOsEnv('DB_LOGGING')
  },
  graphql: {
    enabled: toBool(getOsEnv('GRAPHQL_ENABLED')),
    route: getOsEnv('GRAPHQL_ROUTE'),
    editor: toBool(getOsEnv('GRAPHQL_EDITOR'))
  },
  eventsQueue: {
    region: getOsEnv('AWS_SNS_SQS_REGION'),
    accessKeyId: getOsEnv('AWS_SNS_SQS_ACCESS_KEY'),
    secretAccessKey: getOsEnv('AWS_SNS_SQS_SECRET_KEY'),
    snsEndpoint: getOsEnv('AWS_SNS_ENDPOINT'),
    sqsEndpoint: getOsEnv('AWS_SQS_ENDPOINT'),
    topicName: getOsEnv('AWS_SNS_TOPIC'),
    queueName: getOsEnv('AWS_SQS_QUEUE_NAME')
  },
  swagger: {
    enabled: toBool(getOsEnv('SWAGGER_ENABLED')),
    route: getOsEnv('SWAGGER_ROUTE'),
    file: getOsEnv('SWAGGER_FILE'),
    username: getOsEnv('SWAGGER_USERNAME'),
    password: getOsEnv('SWAGGER_PASSWORD')
  },
  monitor: {
    enabled: toBool(getOsEnv('MONITOR_ENABLED')),
    route: getOsEnv('MONITOR_ROUTE'),
    username: getOsEnv('MONITOR_USERNAME'),
    password: getOsEnv('MONITOR_PASSWORD')
  },
  mailing: {
    fromEmail: 'alexandru.munteanu@hindawi.com',
    toEmail: 'alexandru.munteanu@hindawi.com'
  }
};
