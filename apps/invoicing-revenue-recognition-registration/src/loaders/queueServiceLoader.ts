import { Consumer } from 'sqs-consumer';
import AWS from 'aws-sdk';
import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { env } from '../env';
import { Context } from '../builders';
import * as eventHandlers from '../queue_service/handlers';

export const queueServiceLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && env.aws.enabled) {
    const context: Context = settings.getData('context');

    // Configure the region
    AWS.config.update({
      region: env.aws.sqs.region,
      accessKeyId: env.aws.sqs.accessKey,
      secretAccessKey: env.aws.sqs.secretAccessKey,
    });

    const sqs: any = new AWS.SQS();

    const sqsConsumer = Consumer.create({
      sqs,
      queueUrl: env.aws.sqs.queueName,
      handleMessage: async (message) => {
        eventHandlers.ERPRevenueRecognitionRegistration.handler(context)(
          message
        );
      },
    });

    sqsConsumer.on('error', (err) => {
      console.error(err.message);
      process.exit(1);
    });

    sqsConsumer.on('processing_error', (err) => {
      console.error(err.message);
    });

    console.log(`SQS service is running for ${env.aws.sqs.queueName}`);

    sqsConsumer.start();
  }
};
