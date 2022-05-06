import { QueueEventConsumer, SqsEventConsumer } from '@hindawi/queue-utils';
import { LoggerBuilder } from '@hindawi/shared';

import {
  ObjectStoreServiceContract,
  SubmissionServiceContract,
  ArchiveServiceContract,
  XmlServiceContract,
  SubmissionService,
  ArchiveService,
  XmlService,
  S3Service,
} from '@hindawi/import-manuscript-commons';

import { EmailService } from '../libs/email';

import { env } from '../env';
import {
  KeycloakAuthenticator
} from "../../../../libs/import-manuscript-commons/src/lib/services/implementations/keycloakAuthenticator";
import Keycloak from "keycloak-connect";

export interface Services {
  objectStoreService: ObjectStoreServiceContract;
  submissionService: SubmissionServiceContract;
  archiveService: ArchiveServiceContract;
  xmlService: XmlServiceContract;
  jobQueue: QueueEventConsumer;
  emailService: EmailService;
}

export function buildServices(): Services {
  const keycloak = new Keycloak({}, env.app.submissionKeycloakConfig);

  const reviewSystemAuthenticator: KeycloakAuthenticator = new KeycloakAuthenticator(
    env.app.submissionAdminUsername,
    env.app.submissionAdminPassword,
    keycloak
  )

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
    submissionService: new SubmissionService(
      env.app.submissionGraphqlEndpoint,
      reviewSystemAuthenticator
    ),
  };

  return services;
}
