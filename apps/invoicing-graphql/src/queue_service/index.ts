const logger = require('@pubsweet/logger');
const { createQueueService } = require('@hindawi/queue-service');

import { makeDb } from '../services/knex';
import { makeConfig } from '../config';
import { makeContext } from '../context';

import { environment } from '@env/environment';
import * as eventHandlers from './handlers';

const config = {
  accessKeyId: process.env.AWS_SNS_SQS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SNS_SQS_SECRET_KEY,
  region: process.env.AWS_SNS_SQS_REGION || environment.AWS_SNS_SQS_REGION,
  snsEndpoint: process.env.AWS_SNS_ENDPOINT || environment.AWS_SNS_ENDPOINT,
  sqsEndpoint: process.env.AWS_SQS_ENDPOINT || environment.AWS_SQS_ENDPOINT,
  topicName: process.env.AWS_SNS_TOPIC || environment.AWS_SNS_TOPIC,
  queueName: process.env.AWS_SQS_QUEUE_NAME || environment.AWS_SQS_QUEUE_NAME,
  eventNamespace: process.env.EVENT_NAMESPACE || environment.EVENT_NAMESPACE,
  publisherName: process.env.PUBLISHER_NAME || environment.PUBLISHER_NAME,
  serviceName: process.env.SERVICE_NAME || environment.SERVICE_NAME
};

export const queueService = createQueueService(config)
  .then(async (messageQueue: any) => {
    const queueServiceConfig = await makeConfig();
    const db = await makeDb(queueServiceConfig);
    const context = makeContext(queueServiceConfig, db);

    Object.keys(eventHandlers).forEach((eventHandler: string) => {
      const { handler, event } = eventHandlers[eventHandler];

      // if (event === 'SubmissionQualityCheckPassed') {
      //   messageQueue.__LOCAL__ = {
      //     event,
      //     handler: handler.bind(context)
      //   };
      // }

      messageQueue.registerEventHandler({
        event,
        handler: handler.bind(context)
      });
    });

    return messageQueue;
  })
  .catch((err: any) => {
    logger.error('FATAL ERROR, SHUTTING DOWN:', err);
    process.exit(1);
  });
