import AWS from 'aws-sdk';
import { BatchUtils } from 'libs/shared/src/lib/utils/Batch';
import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import { Consumer } from 'sqs-consumer';
import { env } from '../env';
import { ReportingContext } from './contextLoader';
import { ReportingHandlers } from './handlerLoader';

export const queueServiceLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const context: ReportingContext = settings.getData('context');
  const handlers: ReportingHandlers = settings.getData('handlers');
  const { sqs } = context.services;

  const { QueueUrl } = await sqs
    .getQueueUrl({ QueueName: env.aws.sqs.queueName })
    .promise();

  const handler = BatchUtils.withTimeout<AWS.SQS.Message>(
    handlers.saveEventsHandler,
    env.app.batchSize,
    env.app.batchTimeout
  );

  const sqsConsumer = Consumer.create({
    sqs,
    queueUrl: QueueUrl,
    batchSize: 10,
    handleMessageBatch: handler,
  });

  if (!env.aws.sqs.disabled && !sqsConsumer.isRunning) {
    sqsConsumer.start();
  }
};
