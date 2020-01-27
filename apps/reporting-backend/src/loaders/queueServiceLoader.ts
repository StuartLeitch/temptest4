// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Consumer } = require('sqs-consumer');
import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import AWS from 'aws-sdk';

import { EventDTO } from 'libs/shared/src/lib/modules/reporting/domain/EventDTO';
import { EventMappingRegistry } from 'libs/shared/src/lib/modules/reporting/EventMappingRegistry';
import {
  InvoiceMappingPolicy,
  JournalMappingPolicy,
  SubmissionMappingPolicy,
  UserMappingPolicy
} from 'libs/shared/src/lib/modules/reporting/policies';
import { SaveEventsUsecase } from 'libs/shared/src/lib/modules/reporting/usecases/saveEvents/saveEvents';
import { BatchUtils } from 'libs/shared/src/lib/utils/BatchUtils';

import { env } from '../env';
import { Logger } from '../lib/logger';
import { parseEvent } from '../queue_service/handlers';

const logger = new Logger('queueService:loader');

export const queueServiceLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const context = settings.getData('context');

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

  const sqs = new AWS.SQS(config);

  let { QueueUrl } = await sqs
    .getQueueUrl({ QueueName: config.queueName })
    .promise();

  const registry = new EventMappingRegistry();

  registry.addPolicy(new InvoiceMappingPolicy());
  registry.addPolicy(new SubmissionMappingPolicy());
  registry.addPolicy(new JournalMappingPolicy());
  registry.addPolicy(new UserMappingPolicy());

  const saveEventsUsecase = new SaveEventsUsecase(
    context.repos.eventsRepo,
    registry
  );

  const handler = BatchUtils.withTimeout<EventDTO>(
    async events => {
      let filteredEvents = events
        .map(parseEvent)
        .filter(e => !!e && e.event && e.id && e.data);
      if (events.length !== filteredEvents.length) {
        logger.info(
          'Filtered ' + (events.length - filteredEvents.length) + ' events'
        );
      }
      const start = new Date();
      try {
        await saveEventsUsecase.execute({ events: filteredEvents });
      } catch (error) {
        logger.error(error);
      }
      logger.info(
        `Saving ${filteredEvents.length} events took ${(new Date().getTime() -
          start.getTime()) /
          1000} seconds.`
      );
    },
    env.app.batchSize,
    env.app.batchTimeout
  );
  const sqsConsumer = Consumer.create({
    sqs,
    queueUrl: QueueUrl,
    batchSize: 10,
    handleMessageBatch: handler
  });

  if (!sqsConsumer.isRunning) {
    sqsConsumer.start();
  }
};
