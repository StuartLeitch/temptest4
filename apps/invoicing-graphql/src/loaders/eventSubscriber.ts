// import glob from 'glob';
import * as AWS from 'aws-sdk';
import {Consumer} from 'sqs-consumer';
import {isEmpty, get, pipe} from 'lodash/fp';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';

import {environment} from '../environments/environment';
import {Logger} from '../lib/logger';

const log = new Logger(__filename);

// import {ConfigService} from '../config/config.service';

const eventHandlerMap = {};

const extractMessage = pipe(
  get('Body'),
  JSON.parse,
  get('Message'),
  JSON.parse
);

const handleMessage = async ({event, data}) => {
  if (isEmpty(eventHandlerMap[event])) return;
  return Promise.all(
    eventHandlerMap[event].map(async handler => handler(data))
  );
};

const createSqsConsumer = async ({
  region,
  queueName,
  sqsEndpoint,
  accessKeyId,
  handleMessage,
  secretAccessKey
}) => {
  const sqs = new AWS.SQS({
    region,
    accessKeyId,
    secretAccessKey,
    endpoint: sqsEndpoint
  });

  const {QueueUrl} = await sqs.getQueueUrl({QueueName: queueName}).promise();
  // if (process.env.NODE_ENV === 'development') {
  //   QueueUrl = QueueUrl.replace('sqs', 'localhost');
  // }

  const sqsConsumer = Consumer.create({
    sqs,
    queueUrl: QueueUrl,
    handleMessage
  });

  sqsConsumer.on('error', log.error);
  sqsConsumer.on('processing_error', log.error);

  return sqsConsumer;
};

const createQueueService = async ({
  region,
  accessKeyId,
  secretAccessKey,
  // snsEndpoint,
  sqsEndpoint,
  // topicName,
  queueName
}) => {
  // const sns = new AWS.SNS({
  //   endpoint: snsEndpoint,
  //   region,
  //   accessKeyId,
  //   secretAccessKey
  // });

  // const {TopicArn} = await sns.createTopic({Name: topicName}).promise();

  const handleExtractedMessage = pipe(
    extractMessage,
    handleMessage
  );

  const sqsConsumer = await createSqsConsumer({
    handleMessage: handleExtractedMessage,
    sqsEndpoint,
    queueName,
    region,
    accessKeyId,
    secretAccessKey
  });

  return {
    // async publishMessage(message) {
    //   const Message = JSON.stringify(message);
    //   // info(yellow(`Sending message: ${Message}`));

    //   return sns.publish({TopicArn, Message}).promise();
    // },

    registerEventHandler({event, handler}) {
      if (isEmpty(eventHandlerMap[event])) eventHandlerMap[event] = [];

      eventHandlerMap[event].push(handler);
    },
    start() {
      if (!sqsConsumer.isRunning) {
        sqsConsumer.start();
      }
      log.info(`Service connected to queue`);
    }
  };
};

/**
 * eventSubscriber
 */
export const eventSubscriberLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
  if (settings) {
    // debug('Create Queue Service...');
    const queueService = await createQueueService({
      region: environment.eventsQueue.region,
      accessKeyId: environment.eventsQueue.accessKeyId,
      secretAccessKey: environment.eventsQueue.secretAccessKey,
      // snsEndpoint: environment.eventsQueue.snsEndpoint,
      sqsEndpoint: environment.eventsQueue.sqsEndpoint,
      // topicName: environment.eventsQueue.topicName,
      queueName: environment.eventsQueue.queueName
    });

    if ('start' in queueService) {
      log.info('Queue Service created.');
      log.info('Register Event Handlers...');

      queueService.registerEventHandler({
        event: 'ManuscriptSubmitted',
        handler: async data => {
          const {
            id: articleId,
            journalId,
            title,
            articleTypeId,
            created,
            teams: [
              {
                members: [
                  {
                    alias: {email, country, surname}
                  }
                ]
              }
            ]
          } = data.manuscript;

          // TODO: Add the usecase to process this data
        }
      });

      queueService.registerEventHandler({
        event: 'ManuscriptRejected',
        handler: async data => {
          // TODO: Add the usecase to process this data
        }
      });

      queueService.registerEventHandler({
        event: 'ManuscriptAccepted',
        handler: async data => {
          // TODO: Add the usecase to process this data
        }
      });

      queueService.start();
    }
  }
};
