import { Consumer } from 'sqs-consumer';
import { SQS } from 'aws-sdk';
import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { env } from '../env';
import { Context } from '../builders';

export const queueServiceLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && env.aws.enabled) {
    const context: Context = settings.getData('context');

    const queue = context?.services?.qq;

    const sqs: any = new SQS();

    let { QueueUrl } = await sqs
      .getQueueUrl({ QueueName: env.aws.sqs.queueName })
      .promise();

    const sqsConsumer = Consumer.create({
      sqs,
      queueUrl: QueueUrl,
      handleMessage: async (message) => {
        console.log(message);
      },
    });

    sqsConsumer.on('error', console.error);

    sqsConsumer.on('processing_error', console.error);

    sqsConsumer.start();
  }
};
