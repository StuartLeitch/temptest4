import {GluegunToolbox} from 'gluegun';
import * as AWS from 'aws-sdk';
import {Consumer} from 'sqs-consumer';
import {isEmpty, get, pipe} from 'lodash/fp';

import {ConfigService} from '../config/config.service';

// add your CLI-specific functionality here, which will then be accessible
// to your commands
module.exports = async (toolbox: GluegunToolbox) => {
  const {
    print: {
      // spin,
      // debug,
      info,
      success,
      // error,
      colors: {yellow}
    }
  } = toolbox;
  // enable this if you want to read configuration in from
  // the current folder's package.json (in a "cli" property),
  // cli.config.json, etc.
  const configService = new ConfigService('.env');
  toolbox.configService = configService;

  const eventHandlerMap = {};

  toolbox.extractMessage = pipe(
    get('Body'),
    JSON.parse,
    get('Message'),
    JSON.parse
  );

  toolbox.handleMessage = async ({event, data}) => {
    if (isEmpty(eventHandlerMap[event])) return;
    info(yellow(`Event triggered: ${event}`));
    return Promise.all(
      eventHandlerMap[event].map(async handler => handler(data))
    );
  };

  toolbox.createSqsConsumer = async ({
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

    let {QueueUrl} = await sqs.getQueueUrl({QueueName: queueName}).promise();

    if (process.env.NODE_ENV === 'development') {
      QueueUrl = QueueUrl.replace('sqs', 'localhost');
    }

    const sqsConsumer = Consumer.create({
      sqs,
      queueUrl: QueueUrl,
      handleMessage
    });

    sqsConsumer.on('error', console.error.bind(console));
    sqsConsumer.on('processing_error', console.error.bind(console));

    return sqsConsumer;
  };

  toolbox.createQueueService = async ({
    region,
    accessKeyId,
    secretAccessKey,
    snsEndpoint,
    sqsEndpoint,
    topicName,
    queueName
  }) => {
    const sns = new AWS.SNS({
      endpoint: snsEndpoint,
      region,
      accessKeyId,
      secretAccessKey
    });

    const {TopicArn} = await sns.createTopic({Name: topicName}).promise();

    const handleExtractedMessage = pipe(
      toolbox.extractMessage,
      toolbox.handleMessage
    );

    const sqsConsumer = await toolbox.createSqsConsumer({
      handleMessage: handleExtractedMessage,
      sqsEndpoint,
      queueName,
      region,
      accessKeyId,
      secretAccessKey
    });

    return {
      async publishMessage(message) {
        const Message = JSON.stringify(message);
        info(yellow(`Sending message: ${Message}`));

        return sns.publish({TopicArn, Message}).promise();
      },

      registerEventHandler({event, handler}) {
        if (isEmpty(eventHandlerMap[event])) eventHandlerMap[event] = [];

        eventHandlerMap[event].push(handler);
      },
      start() {
        if (!sqsConsumer.isRunning) {
          sqsConsumer.start();
        }
        success(`Service connected to queue!`);
      }
    };
  };
};
