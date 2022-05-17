import { QueueEventConsumer, SqsEventConsumer } from '@hindawi/queue-utils';
import { KeycloakAuthenticator } from '@hindawi/import-manuscript-commons';

import {
  ObjectStoreServiceContract,
  ReviewClientContract,
  ArchiveServiceContract,
  XmlServiceContract,
  ReviewClient,
  ArchiveService,
  XmlService,
  S3Service,
} from '@hindawi/import-manuscript-commons';

import { EmailService } from '../libs/email';

import Keycloak from 'keycloak-connect';
import { LoggerBuilder, LogLevel } from '@hindawi/shared';
import { env } from '../env';

export interface Services {
  objectStoreService: ObjectStoreServiceContract;
  reviewClient: ReviewClientContract;
  archiveService: ArchiveServiceContract;
  xmlService: XmlServiceContract;
  jobQueue: QueueEventConsumer;
  emailService: EmailService;
}

export function buildServices(): Services {
  const keycloak = new Keycloak({}, env.app.submissionKeycloakConfig);

  const loggerBuilder = new LoggerBuilder(
    LogLevel[env.log.level]
    // {
    //   isDevelopment: env.isDevelopment,
    //   logLevel: env.log.level,
    // }
  );
  const reviewSystemAuthenticator: KeycloakAuthenticator =
    new KeycloakAuthenticator(
      env.app.submissionAdminUsername,
      env.app.submissionAdminPassword,
      keycloak,
      loggerBuilder
    );

  const services: Services = {
    objectStoreService: new S3Service(
      env.aws.s3.zipBucket,
      env.aws.region,
      env.aws.accessKey,
      env.aws.secretKey
    ),
    jobQueue: new SqsEventConsumer(
      env.aws.sqs.jobQueue,
      env.aws.region,
      env.aws.sqs.endpoint,
      env.aws.accessKey,
      env.aws.secretKey
    ),
    archiveService: new ArchiveService(),
    xmlService: new XmlService(),
    emailService: new EmailService(
      env.aws.ses.accessKey,
      env.aws.ses.secretKey,
      env.aws.region
    ),
    reviewClient: new ReviewClient(
      env.app.submissionGraphqlEndpoint,
      reviewSystemAuthenticator,
      loggerBuilder
    ),
  };

  return services;
}
