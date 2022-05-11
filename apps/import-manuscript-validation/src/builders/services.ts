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
  AuthorInput,
  SubmissionUploadFile,
  UpdateDraftManuscriptInput,
  CreateDraftManuscriptInput,
} from '@hindawi/import-manuscript-commons';

import { EmailService } from '../libs/email';

import { env } from '../env';
import { KeycloakAuthenticator } from '../../../../libs/import-manuscript-commons/src/lib/services/implementations/keycloakAuthenticator';
import Keycloak from 'keycloak-connect';
import { SubmissionFile } from '../../../../libs/import-manuscript-commons/src/lib/models/submission-system-models/file-submission';
import * as fs from 'fs';

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

  const autoSaveInput: UpdateDraftManuscriptInput = {
    meta: {
      title: 'Ree',
      abstract: '',
      agreeTc: true,
      conflictOfInterest: '',
      dataAvailability: '',
      fundingStatement: '',
      articleTypeId: '',
      fromJournal: '',
    },
    authors: [],
    files: [],
    journalId: '03c3c41e-bded-4323-a482-88d805ba35bb',
    sectionId: null,
    preprintValue: null,
    sourceJournalId: null,
    sourceJournalManuscriptId: null,
  };

  const input: CreateDraftManuscriptInput = {
    journalId: '03c3c41e-bded-4323-a482-88d805ba35bb',
    sectionId: '',
    specialIssueId: '',
    customId: '5108482',
  };

  services.submissionService
    .createNewDraftSubmission(input)
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((exception) => console.log(exception));

  services.submissionService
    .updateDraftManuscript(
      'ec17ead8-e79d-40ca-8c2b-be548764e2be',
      autoSaveInput
    )
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((exception) => console.log(exception));

  return services;
}
