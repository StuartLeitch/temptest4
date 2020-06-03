import 'reflect-metadata';
import { bootstrapMicroframework } from 'microframework-w3tec';

import { banner } from './lib/banner';
import { Logger } from './lib/logger';
import './lib/logger/LoggerAspect';

/**
 * Loaders
 */
import { winstonLoader } from './loaders/winstonLoader';
import { knexLoader } from './loaders/knexLoader';
import { contextLoader } from './loaders/contextLoader';
import { queueServiceLoader } from './loaders/queueServiceLoader';
import { schedulerLoader } from './loaders/schedulerLoader';
import { domainEventsRegisterLoader } from './loaders/domainEventsLoader';
import { expressLoader } from './loaders/expressLoader';
import { monitorLoader } from './loaders/monitorLoader';
import { graphqlLoader } from './loaders/graphqlLoader';
import { sisifLoader } from './loaders/sisifLoader';

/**
 * EXPRESS TYPESCRIPT BOILERPLATE
 * ----------------------------------------
 *
 * This is a boilerplate for Node.js Application written in TypeScript.
 * The basic layer of this app is express. For further information visit
 * the 'README.md' file.
 */
const log = new Logger(/*__filename*/);

bootstrapMicroframework({
  /**
   * Loader is a place where you can configure all your modules during microframework
   * bootstrap process. All loaders are executed one by one in a sequential order.
   */
  loaders: [
    winstonLoader,
    knexLoader,
    contextLoader,
    queueServiceLoader,
    schedulerLoader,
    domainEventsRegisterLoader,
    expressLoader,
    monitorLoader,
    graphqlLoader,
    sisifLoader,
  ],
})
  .then(() => banner(log))
  .catch((error) => {
    log.error('Application crashed', error);
    process.exit(1);
  });
