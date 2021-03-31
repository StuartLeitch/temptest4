import { S3, SQS } from 'aws-sdk';
import Knex from 'knex';

import {
  Event,
  FileResumeService,
  // HttpPublishConsumer,
  S3EventProducer,
  // SqsPublishConsumer,
  UsecasePublishConsumer,
  // CounterConsumer,
} from '../../libs/eve/src';
// import { LoggerBuilder } from '../../libs/shared/src';
import {REPORTING_TABLES} from '../../libs/shared/src/lib/modules/reporting/constants';
import { defaultRegistry } from '../../libs/shared/src/lib/modules/reporting/EventMappingRegistry';
import { FilterEventsService } from '../../libs/shared/src/lib/modules/reporting/services/FilterEventsService';
import { SaveEventsUsecase } from '../../libs/shared/src/lib/modules/reporting/usecases/saveEvents/saveEvents';
import { SaveSqsEventsUsecase } from '../../libs/shared/src/lib/modules/reporting/usecases/saveSqsEvents/saveSqsEvents';
import { KnexEventsRepo } from '../../libs/shared/src/lib/modules/reporting/repos/implementation/KnexEventsRepo';

const kill = (babalache: unknown): void => {
  console.info(babalache);
  process.exit(0);
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
const logWithTime = (val) => console.log(new Date().toJSON().substr(11, 12), val);

const { env } = process;

const s3Config = {
  secretAccessKey: env.AWS_S3_SECRET_KEY,
  accessKeyId: env.AWS_S3_ACCESS_KEY,
  bucketName: env.AWS_S3_EVENT_STORAGE_BUCKET,
  region: env.AWS_S3_REGION,
};

const s3 = new S3(s3Config);
const fsResumeService = new FileResumeService(env.RESUME_DIR);

const producer = new S3EventProducer(s3, s3Config.bucketName, fsResumeService);

let tasks = [];

const knex = Knex({
  client: 'pg',
  connection: {
    host: env.DB_HOST,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
  },
  // debug: env.DB_DEBUG || false
});

// const loggerBuilder = new LoggerBuilder();
// const filterEventsServiceLogger = loggerBuilder.getLogger();
// filterEventsServiceLogger.setScope('service:FilterEvents');
// kill(filterEventsServiceLogger);
const filterEventsServiceLogger = {
  info: console.info.bind(console),
  warn: console.info.bind(console),
  debug: console.info.bind(console),
  error: console.info.bind(console),
  setScope: console.info.bind(console),
};

const filterEventsService = new FilterEventsService(
  s3,
  filterEventsServiceLogger
);

const eventsRepo = new KnexEventsRepo(knex);
const saveEventsUsecase = new SaveEventsUsecase(eventsRepo, defaultRegistry);
// const saveSqsEventsLogger = loggerBuilder.getLogger();
// saveSqsEventsLogger.setScope('saveSqsEvents:usecase');
const saveSqsEventsUsecase = new SaveSqsEventsUsecase(
  filterEventsService,
  saveEventsUsecase,
  filterEventsServiceLogger
);

const mapCount = Object.values(REPORTING_TABLES).reduce((acc, table) => {
  acc[table] = 0;
  return acc;
}, {});

const consumer = new UsecasePublishConsumer<any>(saveSqsEventsUsecase, mapCount); // saveSqsEventsUsecase support both EveEvent and SqsEvent
consumer.setTotalLimitPerTable(Number(env.TOTAL_EVENTS_PER_TABLE_LIMIT));

let total_limit_break = false;
if (env.ENABLE_TOTAL_LIMIT === 'true') {
  total_limit_break = true;
}
const isAboveThreshold = (currentValue) => currentValue > env.TOTAL_EVENTS_PER_TABLE_LIMIT;

const main = async () => {
  logWithTime('Start');

  if (Number(env.WORKER_COUNT) === 1) {
    // for await (const event of producer.produce()) {
    //  await consumer.consume(event);
    // }
  } else {
    const LIMIT = Number(env.TOTAL_EVENTS_LIMIT);
    let counter = 0;
    for await (const event of producer.produce()) {

      if (total_limit_break && counter > LIMIT) {
        break;
      }

      if (Object.values(mapCount).every(isAboveThreshold)) {
        break;
      }

      // * queue task
      tasks.push(consumer.consume(event));

      if (tasks.length >= Number(env.WORKER_COUNT)) {
        await Promise.all(tasks);
        tasks = [];
      }

      counter += event.length;

      logWithTime(mapCount);
    }

    // * finish all tasks
    await Promise.all(tasks);
  }

  logWithTime('Start');
  process.exit(0);
};

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(0);
}
