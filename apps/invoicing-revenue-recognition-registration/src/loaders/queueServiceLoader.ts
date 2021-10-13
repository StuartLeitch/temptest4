import AWS from 'aws-sdk';
import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';
import { SqsQueueConsumer } from '@hindawi/queue-utils';

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

    const sqsConsumer = new SqsQueueConsumer(env.aws.sqs.queueName);

    sqsConsumer.registerHandler(
      'RevenueRecognitionRegistration',
      eventHandlers.ERPRevenueRecognitionRegistration.handler(context)
    );

    console.log(`SQS service is running for ${env.aws.sqs.queueName}`);

    await sqsConsumer.start();
  }
};
