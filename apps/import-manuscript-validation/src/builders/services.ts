import { QueueEventConsumer, SqsEventConsumer } from '@hindawi/queue-utils';
import { LoggerBuilder } from '@hindawi/shared';

import {
  ObjectStoreServiceContract,
  ArchiveServiceContract,
  ArchiveService,
  S3Service,
} from '@hindawi/import-manuscript-commons';

import { env } from '../env';

export interface Services {
  objectStoreService: ObjectStoreServiceContract;
  archiveService: ArchiveServiceContract;
  jobQueue: QueueEventConsumer;
}

export function buildServices(loggerBuilder: LoggerBuilder): Services {
  const services: Services = {
    objectStoreService: new S3Service(
      env.aws.s3.zipBucket,
      env.aws.region,
      env.aws.accessKey,
      env.aws.secretKey
    ),
    jobQueue: new SqsEventConsumer(
      env.aws.sqs.jobQueue,
      env.aws.region,
      env.aws.sqs.endpoint,
      env.aws.accessKey,
      env.aws.secretKey
    ),
    archiveService: new ArchiveService(),
  };

  return services;
}
