import {
  Event,
  HttpPublishConsumer,
  S3EventProducer,
  SqsPublishConsumer,
  FileResumeService
} from '@hindawi/eve';
import { S3, SQS } from 'aws-sdk';
import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import { ConsumerTransport } from '../contants';
import { env } from '../env';
import { Logger } from '../lib/logger';

export const pullHistoricEventsLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const s3Config = {
    secretAccessKey: env.aws.s3.secretKey,
    accessKeyId: env.aws.s3.accessKey,
    apiVersion: env.aws.s3.apiVersion,
    bucketName: env.aws.s3.bucketName,
    region: env.aws.s3.region
  };

  const s3 = new S3(s3Config);
  const fsResumeService = new FileResumeService(env.app.resumeDir);
  const producer = new S3EventProducer(
    s3,
    s3Config.bucketName,
    fsResumeService
  );

  let consumer;
  switch (env.consumerTransport) {
    case ConsumerTransport.HTTP:
      consumer = new HttpPublishConsumer(
        env.consumerHttp.host,
        env.consumerHttp.token,
        new Logger('publisher:http')
      );
      break;

    case ConsumerTransport.SQS:
      const sqsConfig = {
        secretAccessKey: env.aws.sqs.secretKey,
        accessKeyId: env.aws.sqs.accessKey,
        apiVersion: env.aws.sqs.apiVersion,
        queueName: env.aws.sqs.queueName,
        region: env.aws.sqs.region
      };
      const sqs = new SQS(sqsConfig);
      consumer = new SqsPublishConsumer<Event>(sqs, sqsConfig.queueName);
      break;
    default:
      throw new Error('Unknown consumer type');
  }

  for await (const event of producer.produce()) {
    await consumer.consume(event);
  }
};
