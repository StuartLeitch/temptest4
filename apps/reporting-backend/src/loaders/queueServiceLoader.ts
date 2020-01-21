// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createQueueService } = require('@hindawi/queue-service');

import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';

import { env } from '../env';
import { Logger } from '../lib/logger';

import eventHandlers from '../queue_service/handlers';

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

  let queue: any;
  try {
    queue = await createQueueService(config);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }

  Object.keys(eventHandlers).forEach((eventHandler: string) => {
    const { handler, event } = eventHandlers[eventHandler];
    queue.registerEventHandler({
      event,
      handler: handler.bind(context)
    });
  });

  queue.start();
};
