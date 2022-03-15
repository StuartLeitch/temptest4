import { QueueEventConsumer, SqsEventConsumer } from '@hindawi/queue-utils';
import { EmailService, LoggerBuilder } from '@hindawi/shared';
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

import { env } from '../env';
import Keycloak from 'keycloak-connect';

export interface Services {
  objectStoreService: ObjectStoreServiceContract;
  reviewClient: ReviewClientContract;
  archiveService: ArchiveServiceContract;
  xmlService: XmlServiceContract;
  jobQueue: QueueEventConsumer;
  emailService: EmailService;
}

export function buildServices(loggerBuilder: LoggerBuilder): Services {
  const keycloak = new Keycloak({}, env.app.submissionKeycloakConfig);

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
    xmlService: new XmlService(loggerBuilder.getLogger(XmlService.name)),
    emailService: new EmailService(
      env.app.mailingDisabled,
      env.app.reviewAppBasePath,
      'ImportManuscript',
      '',
      ''
    ),
    reviewClient: new ReviewClient(
      env.app.submissionGraphqlEndpoint,
      reviewSystemAuthenticator,
      loggerBuilder
    ),
  };

  return services;
}
