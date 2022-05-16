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
} from '@hindawi/import-manuscript-commons';

import { EmailService } from '../libs/email';

import Keycloak from 'keycloak-connect';

export interface Services {
  objectStoreService: ObjectStoreServiceContract;
  reviewClient: ReviewClientContract;
  archiveService: ArchiveServiceContract;
  xmlService: XmlServiceContract;
  jobQueue: QueueEventConsumer;
  emailService: EmailService;
}

export function buildServices(envVars: any): Services {
  const keycloak = new Keycloak({}, envVars.app.submissionKeycloakConfig);

  const reviewSystemAuthenticator: KeycloakAuthenticator =
    new KeycloakAuthenticator(
      envVars.app.submissionAdminUsername,
      envVars.app.submissionAdminPassword,
      keycloak,
      envVars
    );

  const services: Services = {
    objectStoreService: new S3Service(
      envVars.aws.s3.zipBucket,
      envVars.aws.region,
      envVars.aws.accessKey,
      envVars.aws.secretKey
    ),
    jobQueue: new SqsEventConsumer(
      envVars.aws.sqs.jobQueue,
      envVars.aws.region,
      envVars.aws.sqs.endpoint,
      envVars.aws.accessKey,
      envVars.aws.secretKey
    ),
    archiveService: new ArchiveService(),
    xmlService: new XmlService(),
    emailService: new EmailService(
      envVars.aws.ses.accessKey,
      envVars.aws.ses.secretKey,
      envVars.aws.region
    ),
    reviewClient: new ReviewClient(
      envVars.app.submissionGraphqlEndpoint,
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
