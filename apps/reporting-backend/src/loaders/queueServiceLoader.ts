import { Consumer } from 'sqs-consumer';
import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import AWS from 'aws-sdk';

import { EventMappingRegistry } from 'libs/shared/src/lib/modules/reporting/EventMappingRegistry';
import {
  InvoiceMappingPolicy,
  JournalMappingPolicy,
  SubmissionMappingPolicy,
  UserMappingPolicy,
  ArticleMappingPolicy,
  CheckerMappingPolicy
} from 'libs/shared/src/lib/modules/reporting/policies';
import { SaveEventsUsecase } from 'libs/shared/src/lib/modules/reporting/usecases/saveEvents/saveEvents';
import { BatchUtils } from 'libs/shared/src/lib/utils/Batch';
import { EventDTO } from 'libs/shared/src/lib/modules/reporting/domain/EventDTO';

import { env } from '../env';
import { Logger } from '../lib/logger';

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

  const s3 = new AWS.S3({
    endpoint: process.env.AWS_S3_ENDPOINT,
    secretAccessKey: config.secretAccessKey,
    accessKeyId: config.accessKeyId
  });

  const sqs = new AWS.SQS({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    endpoint: config.sqsEndpoint,
    region: config.region
  });

  let { QueueUrl } = await sqs
    .getQueueUrl({ QueueName: config.queueName })
    .promise();

  const registry = new EventMappingRegistry();

  registry.addPolicy(new InvoiceMappingPolicy());
  registry.addPolicy(new SubmissionMappingPolicy());
  registry.addPolicy(new JournalMappingPolicy());
  registry.addPolicy(new UserMappingPolicy());
  registry.addPolicy(new ArticleMappingPolicy());
  registry.addPolicy(new CheckerMappingPolicy());

  const saveEventsUsecase = new SaveEventsUsecase(
    context.repos.eventsRepo,
    registry
  );

  const handler = BatchUtils.withTimeout<AWS.SQS.Message>(
    async (events: AWS.SQS.Message[]) => {
      let processedEvents: EventDTO[] = [];

      for (const event of events) {
        const { MessageId, Body } = event;
        let id = null;

        let isLongEvent = false;
        let parsedEvent = null;
        try {
          const body = JSON.parse(Body);
          id = body.MessageId;
          isLongEvent =
            body?.MessageAttributes?.PhenomMessageTooLarge?.Value === 'Y' ||
            body?.MessageAttributes['PhenomMessageTooLarge']?.stringValue ===
              'Y';
          parsedEvent = JSON.parse(body.Message);
        } catch (error) {
          logger.error('Failed to parse event: ' + MessageId);
          continue;
        }

        if (isLongEvent) {
          try {
            const [Bucket, Key] = parsedEvent.data.split('::');
            parsedEvent.data = JSON.parse(
              await s3
                .getObject({ Bucket, Key })
                .promise()
                .then(result => result.Body.toString())
            );
          } catch (error) {
            logger.error(error);
            logger.error(
              'Failed to get event from s3 ' +
                JSON.stringify({
                  MessageId,
                  parsedEvent
                })
            );
            continue;
          }
        }

        try {
          processedEvents.push({
            id,
            data: parsedEvent.data,
            event: parsedEvent.event.split(':').pop(),
            timestamp: parsedEvent.timestamp
              ? new Date(parsedEvent.timestamp)
              : new Date()
          });
        } catch (error) {
          logger.error(`Payload not correct for ${MessageId} `);
          logger.error(error);
        }
      }

      let filteredEvents = processedEvents.filter(
        e => !!e && e.event && e.id && e.data
      );
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

  if (!env.aws.sqs.disabled && !sqsConsumer.isRunning) {
    sqsConsumer.start();
  }
};
