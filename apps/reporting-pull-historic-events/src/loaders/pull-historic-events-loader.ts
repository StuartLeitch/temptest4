import {
  Event,
  FileResumeService,
  HttpPublishConsumer,
  S3EventProducer,
  SqsPublishConsumer,
  UsecasePublishConsumer,
} from 'libs/eve/src';
import { S3, SQS } from 'aws-sdk';
import Knex from 'knex';
import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import { ConsumerTransport } from '../contants';
import { env } from '../env';
import { Logger } from '../lib/logger';
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

      const filterEventsService = new FilterEventsService(
        s3,
        new Logger('service:FilterEvents')
      );

      const registry = defaultRegistry;
      const eventsRepo = new KnexEventsRepo(knex);
      const saveEventsUsecase = new SaveEventsUsecase(eventsRepo, registry);
      const saveSqsEventsUsecase = new SaveSqsEventsUsecase(
        filterEventsService,
        saveEventsUsecase,
        new Logger('saveSqsEvents:usecase')
      );
      consumer = new UsecasePublishConsumer<any>(saveSqsEventsUsecase); // saveSqsEventsUsecase support both EveEvent and SqsEvent
      break;
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
        region: env.aws.sqs.region,
      };
      const sqs = new SQS(sqsConfig);
      consumer = new SqsPublishConsumer<Event>(sqs, sqsConfig.queueName);
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
      tasks.push(
        new Promise(async (resolve, reject) => {
          try {
            await consumer.consume(event);
            resolve();
          } catch (error) {
            reject(error);
          }
        })
      );

      if (tasks.length >= env.workerCount) {
        await Promise.all(tasks);
        tasks = [];
      }
    }

    // finish all tasks
    await Promise.all(tasks);
  }
};
