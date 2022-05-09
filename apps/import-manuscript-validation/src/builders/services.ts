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
  S3Service, AuthorInput,
} from '@hindawi/import-manuscript-commons';

import { EmailService } from '../libs/email';

import { env } from '../env';
import { KeycloakAuthenticator } from '../../../../libs/import-manuscript-commons/src/lib/services/implementations/keycloakAuthenticator';
import Keycloak from 'keycloak-connect';

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
    submissionService: new SubmissionService(
      env.app.submissionGraphqlEndpoint,
      reviewSystemAuthenticator
    ),
  };

  const authors: Array<AuthorInput> = [
    {aff:"affiliation", email: "chuck" + Math.floor(Math.random() * 1000)  + "@norris.com", country: "deUndevaDaEroare", affRorId: "ceva", givenNames:"conan", surname:"siatat", isSubmitting:true, isCorresponding: true}
  ]

  services.submissionService
    .setSubmissionAuthors("4ab5efd7-4d87-4284-bfd2-1fc757c4ed8c", authors)
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((exception) => console.log(exception));

  return services;
}
