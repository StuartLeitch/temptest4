const logger = require('@pubsweet/logger');
const {createQueueService} = require('@hindawi/queue-service');

import {environment} from '@env/environment';

const config = {
  accessKeyId: process.env.AWS_SNS_SQS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SNS_SQS_SECRET_KEY,
  region: environment.AWS_SNS_SQS_REGION,
  snsEndpoint: environment.AWS_SNS_ENDPOINT,
  sqsEndpoint: environment.AWS_SQS_ENDPOINT,
  topicName: environment.AWS_SNS_TOPIC,
  queueName: environment.AWS_SQS_QUEUE_NAME,
  eventNamespace: environment.EVENT_NAMESPACE,
  publisherName: environment.PUBLISHER_NAME,
  serviceName: environment.SERVICE_NAME
};

const events = {};

export const queueService = createQueueService(config)
  .then((messageQueue: any) => {
    Object.keys(events).forEach((handler, event) =>
      messageQueue.registerEventHandler({event, handler})
    );
    return messageQueue;
  })
  .catch((err: any) => {
    logger.error('FATAL ERROR, SHUTTING DOWN:', err);
    process.exit(1);
  });
