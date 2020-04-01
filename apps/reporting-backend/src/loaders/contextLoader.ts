import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import { KnexEventsRepo } from '../../../../libs/shared/src/lib/modules/reporting/repos/implementation/KnexEventsRepo';
import { env } from '../env';
import AWS from 'aws-sdk';
import { EventMappingRegistry } from 'libs/shared/src/lib/modules/reporting/EventMappingRegistry';
import {
  InvoiceMappingPolicy,
  SubmissionMappingPolicy,
  JournalMappingPolicy,
  UserMappingPolicy,
  ArticleMappingPolicy,
  CheckerMappingPolicy
} from 'libs/shared/src/lib/modules/reporting/policies';
import { SaveEventsUsecase } from 'libs/shared/src/lib/modules/reporting/usecases/saveEvents/saveEvents';
import { Logger } from '../lib/logger';
import { FilterEventsService } from 'libs/shared/src/lib/modules/reporting/services/FilterEventsService';
export const contextLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const db = settings.getData('connection');

    const repos = {
      eventsRepo: new KnexEventsRepo(db)
    };

    const registry = new EventMappingRegistry();

    registry.addPolicy(new InvoiceMappingPolicy());
    registry.addPolicy(new SubmissionMappingPolicy());
    registry.addPolicy(new JournalMappingPolicy());
    registry.addPolicy(new UserMappingPolicy());
    registry.addPolicy(new ArticleMappingPolicy());
    registry.addPolicy(new CheckerMappingPolicy());

    const saveEventsUsecase = new SaveEventsUsecase(repos.eventsRepo, registry);

    const usecases: ReportingUsecases = { saveEventsUsecase };

    const config = {
      accessKeyId: env.aws.sns.sqsAccessKey,
      secretAccessKey: env.aws.sns.sqsSecretKey,
      region: env.aws.sns.sqsRegion,
      snsEndpoint: env.aws.sns.endpoint,
      sqsEndpoint: env.aws.sqs.endpoint,
      topicName: env.aws.sns.topic,
      queueName: env.aws.sqs.queueName,
      eventNamespace: env.app.eventNamespace,
      publisherName: env.app.publisherName,
      serviceName: env.app.name
    };

    const s3 = new AWS.S3({
      credentials: {
        secretAccessKey: config.secretAccessKey,
        accessKeyId: config.accessKeyId
      }
    });

    const sqs = new AWS.SQS({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      endpoint: config.sqsEndpoint,
      region: config.region
    });

    const filterEventsService = new FilterEventsService(
      s3,
      new Logger('service:FilterEvents')
    );

    const services: ReportingServices = { s3, sqs, filterEventsService };

    const context = {
      repos,
      services,
      usecases
    };

    settings.setData('context', context);
  }
};

interface ReportingUsecases {
  saveEventsUsecase: SaveEventsUsecase;
}

interface ReportingServices {
  s3: AWS.S3;
  sqs: AWS.SQS;
  filterEventsService: FilterEventsService;
}

export interface ReportingContext {
  services: ReportingServices;
  usecases: ReportingUsecases;
}
