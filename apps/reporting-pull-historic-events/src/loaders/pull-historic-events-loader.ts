import { SQS, S3 } from 'aws-sdk';
import {
  MicroframeworkSettings,
  MicroframeworkLoader
} from 'microframework-w3tec';

import { env } from '../env';

import { SqsPublishConsumer, S3EventProducer, Event } from '@hindawi/eve';

export const pullHistoricEventsLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const sqsConfig = {
    secretAccessKey: env.aws.sqs.secretKey,
    accessKeyId: env.aws.sqs.accessKey,
    apiVersion: env.aws.sqs.apiVersion,
    queueName: env.aws.sqs.queueName,
    region: env.aws.sqs.region
  };
  const s3Config = {
    secretAccessKey: env.aws.s3.secretKey,
    accessKeyId: env.aws.s3.accessKey,
    apiVersion: env.aws.s3.apiVersion,
    bucketName: env.aws.s3.bucketName,
    region: env.aws.s3.region
  };

  const sqs = new SQS(sqsConfig);
  const s3 = new S3(s3Config);

  const consumer = new SqsPublishConsumer<Event>(sqs, sqsConfig.queueName);
  const producer = new S3EventProducer(s3, s3Config.bucketName);

  for await (const event of producer.produce()) {
    consumer.consume(event);
  }
};
