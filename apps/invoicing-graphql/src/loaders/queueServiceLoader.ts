import { createQueueService } from '@hindawi/queue-service';

import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';

import { env } from '../env';
import { Logger } from '../lib/logger';

import * as eventHandlers from '../queue_service/handlers';

const logger = new Logger(__filename);

export const queueServiceLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && env.aws.enabled) {
    const context = settings.getData('context');

    const config = {
      region: env.aws.sns.sqsRegion,
      accessKeyId: env.aws.sns.sqsAccessKey,
      secretAccessKey: env.aws.sns.sqsSecretKey,
      snsEndpoint: env.aws.sns.endpoint,
      sqsEndpoint: env.aws.sqs.endpoint,
      s3Endpoint: env.aws.s3.endpoint,
      topicName: env.aws.sns.topic,
      queueName: env.aws.sqs.queueName,
      bucketName: env.aws.s3.largeEventBucket,
      bucketPrefix: env.aws.s3.bucketPrefix,
      eventNamespace: env.app.eventNamespace,
      publisherName: env.app.publisherName,
      serviceName: env.app.name,
      defaultMessageAttributes: env.app.defaultMessageAttributes,
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
        handler: handler.bind(context),
      });
    });

    queue.start();
    context.qq = queue;
  }
};
