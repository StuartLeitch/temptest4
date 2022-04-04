/* eslint-disable no-case-declarations */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { S3, SQS } from 'aws-sdk';
import Knex from 'knex';
import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import { ConsumerTransport } from '../contants';
import { env } from '../env';
// import { Logger } from '../lib/logger';

import { LoggerBuilder } from '@hindawi/shared';
import {
  Event,
  FileResumeService,
  HttpPublishConsumer,
  S3EventProducer,
  SqsPublishConsumer,
  UsecasePublishConsumer,
  CounterConsumer,
} from 'libs/eve/src';
import { defaultRegistry } from 'libs/shared/src/lib/modules/reporting/EventMappingRegistry';
import { FilterEventsService } from 'libs/shared/src/lib/modules/reporting/services/FilterEventsService';
import { SaveEventsUsecase } from 'libs/shared/src/lib/modules/reporting/usecases/saveEvents/saveEvents';
import { SaveSqsEventsUsecase } from 'libs/shared/src/lib/modules/reporting/usecases/saveSqsEvents/saveSqsEvents';
import { KnexEventsRepo } from 'libs/shared/src/lib/modules/reporting/repos/implementation/KnexEventsRepo';

export const pullHistoricEventsLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const s3Config = {
    secretAccessKey: env.aws.s3.secretKey,
    accessKeyId: env.aws.s3.accessKey,
    apiVersion: env.aws.s3.apiVersion,
    bucketName: env.aws.s3.bucketName,
    region: env.aws.s3.region,
  };

  const s3 = new S3(s3Config);
  const fsResumeService = new FileResumeService(env.app.resumeDir);
  const producer = new S3EventProducer(
    s3,
    s3Config.bucketName,
    fsResumeService
  );
  const loggerBuilder = new LoggerBuilder();

  let consumer;
  switch (env.consumerTransport) {
    case ConsumerTransport.POSTGRES:
      const knex = Knex({
        client: 'pg',
        connection: {
          host: env.db.host,
          user: env.db.username,
          password: env.db.password,
          database: env.db.database,
        },
        // debug: true
      });
      if (settings) {
        settings.setData('connection', knex);
        settings.onShutdown(() => knex.destroy());
      }

      const filterEventsServiceLogger = loggerBuilder.getLogger();
      filterEventsServiceLogger.setScope('service:FilterEvents');

      const filterEventsService = new FilterEventsService(
        s3,
        filterEventsServiceLogger
      );

      const registry = defaultRegistry;
      const eventsRepo = new KnexEventsRepo(knex);
      const saveEventsUsecase = new SaveEventsUsecase(eventsRepo, registry);
      const saveSqsEventsLogger = loggerBuilder.getLogger();
      saveSqsEventsLogger.setScope('saveSqsEvents:usecase');
      const saveSqsEventsUsecase = new SaveSqsEventsUsecase(
        filterEventsService,
        saveEventsUsecase,
        saveSqsEventsLogger
      );
      consumer = new UsecasePublishConsumer<any>(saveSqsEventsUsecase); // saveSqsEventsUsecase support both EveEvent and SqsEvent
      break;
    case ConsumerTransport.HTTP:
      const publisherHttpLogger = loggerBuilder.getLogger();
      publisherHttpLogger.setScope('publisher:http');
      consumer = new HttpPublishConsumer(
        env.consumerHttp.host,
        env.consumerHttp.token,
        publisherHttpLogger
      );
      break;

    case ConsumerTransport.SQS:
      const sqsConfig = {
        secretAccessKey: env.aws.sqs.secretKey,
        accessKeyId: env.aws.sqs.accessKey,
        apiVersion: env.aws.sqs.apiVersion,
        queueName: env.aws.sqs.queueName,
        region: env.aws.sqs.region,
      };
      const sqs = new SQS(sqsConfig);
      consumer = new SqsPublishConsumer<Event>(sqs, sqsConfig.queueName);
      break;
    case ConsumerTransport.Counter:
      const consumerCounterLogger = loggerBuilder.getLogger();
      consumerCounterLogger.setScope('consumer:counter');
      consumer = new CounterConsumer<Event>(consumerCounterLogger);
      break;
    default:
      throw new Error('Unknown consumer type');
  }

  let tasks = [];

  if (env.workerCount === 1) {
    for await (const event of producer.produce()) {
      await consumer.consume(event);
    }
  } else {
    for await (const event of producer.produce()) {
      // queue task
      tasks.push(consumer.consume(event));

      if (tasks.length >= env.workerCount) {
        await Promise.all(tasks);
        tasks = [];
      }
    }

    // finish all tasks
    await Promise.all(tasks);
  }

  process.exit(0);
};
