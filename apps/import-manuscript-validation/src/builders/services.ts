import { QueueEventConsumer, SqsEventConsumer } from '@hindawi/queue-utils';
import { KeycloakAuthenticator } from '../../../../libs/import-manuscript-commons/src/lib/services/implementations/keycloakAuthenticator';

import {
  ObjectStoreServiceContract,
  ReviewClientContract,
  ArchiveServiceContract,
  XmlServiceContract,
  ReviewClient,
  ArchiveService,
  XmlService,
  S3Service,
} from '../../../../libs/import-manuscript-commons/src';

import { EmailService } from '../libs/email';

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

export function buildServices(): Services {
  const keycloak = new Keycloak({}, env.app.submissionKeycloakConfig);

  const reviewSystemAuthenticator: KeycloakAuthenticator =
    new KeycloakAuthenticator(
      env.app.submissionAdminUsername,
      env.app.submissionAdminPassword,
      keycloak
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
      reviewSystemAuthenticator
    ),
  };

  /*
      figure: 'figure',
      manuscript: 'manuscript',
      supplementary: 'supplementary',
      coverLetter: 'coverLetter',
      reviewComment: 'reviewComment',
      responseToReviewers: 'responseToReviewers',
  */

  // const fileInput :SubmissionUploadFile = {
  //   size: 2,
  //   type: 'supplementary', //manuscript, //
  // };

  return services;
}
