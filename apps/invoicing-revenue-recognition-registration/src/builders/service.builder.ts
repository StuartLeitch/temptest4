/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { createQueueService } from '@hindawi/queue-service';
import {
  ExchangeRateService,
  LoggerContract,
  LoggerBuilder,
  WaiverService,
  VATService,
} from '@hindawi/shared';

import { PhenomSqsServiceContract } from '../queue_service/phenom-queue-service';

import { NetSuiteService } from '../services';

import { env } from '../env';

import { Repos } from './repo.builder';

export interface Services {
  logger: LoggerContract;
  vatService: VATService;
  waiverService: WaiverService;
  exchangeRateService: ExchangeRateService;
  qq: PhenomSqsServiceContract;
  erp: {
    netsuite: NetSuiteService;
  };
}

async function setupQueueService(loggerBuilder: LoggerBuilder) {
  const logger = loggerBuilder.getLogger();
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

  let queue: PhenomSqsServiceContract;
  try {
    queue = await createQueueService(config);
  } catch (err) {
    logger.error(err);
  }

  return queue;
}

export async function buildServices(
  repos: Repos,
  loggerBuilder: LoggerBuilder
): Promise<Services> {
  return {
    logger: loggerBuilder.getLogger(),
    vatService: new VATService(),
    waiverService: new WaiverService(
      repos.invoiceItem,
      repos.editor,
      repos.waiver
    ),
    exchangeRateService: new ExchangeRateService(),
    erp: null,
    qq: env.loaders.queueServiceEnabled
      ? await setupQueueService(loggerBuilder)
      : null,
  };
}
