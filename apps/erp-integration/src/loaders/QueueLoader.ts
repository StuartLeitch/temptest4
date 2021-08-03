import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';
import { SQS } from 'aws-sdk';
import { Consumer } from 'sqs-consumer';

import { createQueueService } from '@hindawi/queue-service';

import { env } from '../env';

export const queueLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const config = {
      region: env.erpIntegration.awsSQSRegion,
      // accessKeyId: env.aws.sns.sqsAccessKey,
      // secretAccessKey: env.aws.sns.sqsSecretKey,
      // snsEndpoint: env.aws.sns.endpoint,
      sqsEndpoint: env.erpIntegration.awsSQSEndpoint,
      // s3Endpoint: env.aws.s3.endpoint,
      // topicName: env.aws.sns.topic,
      queueName: env.erpIntegration.awsSQSQueueName,
      // bucketName: env.aws.s3.largeEventBucket,
      // bucketPrefix: env.aws.s3.bucketPrefix,
      // eventNamespace: env.app.eventNamespace,
      // publisherName: env.app.publisherName,
      serviceName: env.app.name,
      // defaultMessageAttributes: env.app.defaultMessageAttributes,
    };

    // let queue;
    // try {
    //   queue = await createQueueService(config);

    //   queue.registerEventHandler({
    //     event: 'PublishInvoice',
    //     handler: (data) => {
    //       console.log('*********************************************');
    //       console.info(data);
    //       console.log('*********************************************');
    //     },
    //   });
    // } catch (err) {
    //   console.log(
    //     '--------------------- erp queue error ---------------------'
    //   );
    //   console.error(err);
    //   console.log(
    //     '-----------------------------------------------------------'
    //   );
    // }

    // queue.start();

    // settings.setData('queue', queue);

    try {
      const sqs: any = new SQS({
        region: env.erpIntegration.awsRegion,
        accessKeyId: env.erpIntegration.awsSQSAccessKey,
        secretAccessKey: env.erpIntegration.awsSecretKey,
        endpoint: env.erpIntegration.awsSQSEndpoint,
      });

      let { QueueUrl } = await sqs
        .getQueueUrl({ QueueName: env.erpIntegration.awsSQSQueueName })
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
      console.log('loaded sqs');
    } catch (err) {
      console.log('-------------------- erp queue error --------------------');
      console.error(err);
      console.log('---------------------------------------------------------');
    }
  }
};
