import { LoggerContract, LoggerBuilder } from '@hindawi/shared';
import { SqsEventProducer } from '@hindawi/queue-utils';
import {
  UploadServiceContract,
  S3UploadService,
} from '@hindawi/import-manuscript-commons';

import { Repos } from './repo.builder';
import { env } from '../env';

export interface Services {
  uploadService: UploadServiceContract;
  queueService: SqsEventProducer;
  logger: LoggerContract;
}
export async function buildServices(
  repos: Repos,
  loggerBuilder: LoggerBuilder
): Promise<Services> {
  const s3Configuration = {
    region: env.aws.region,
    accessKeyId: env.aws.accessKey,
    secretAccessKey: env.aws.secretKey,
    bucketName: env.aws.s3.zipBucket,
    signedUrlExpirationInSeconds: parseFloat(
      env.aws.s3.signedUrlExpirationInSeconds
    ),
  };
  const sqsService = new SqsEventProducer(
    env.aws.sqs.queueName,
    env.aws.sqs.eventNamespace,
    env.aws.sqs.publisherName,
    env.app.name,
    env.aws.region,
    {},
    env.aws.sqs.endpoint,
    env.aws.accessKey,
    env.aws.secretKey
  );
  await sqsService.start();

  const s3UploadService = new S3UploadService(s3Configuration);

  const services: Services = {
    logger: loggerBuilder.getLogger(),
    uploadService: s3UploadService,
    queueService: sqsService,
  };
  return services;
}
