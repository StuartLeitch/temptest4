import 'reflect-metadata';
import { bootstrapMicroframework } from 'microframework-w3tec';

import { banner } from './lib/banner';
import { Logger } from './lib/logger';
import './lib/logger/LoggerAspect';

import { env } from './env';

/**
 * EXPRESS TYPESCRIPT BOILERPLATE
 * ----------------------------------------
 *
 * This is a boilerplate for Node.js Application written in TypeScript.
 * The basic layer of this app is express. For further information visit
 * the 'README.md' file.
 */
const log = new Logger();

async function main() {
  /**
   * Loaders
   */
  const loaders = [
    // winstonLoader,
    // knexLoader,
    // contextLoader,
    // expressLoader,
    // monitorLoader,
    // graphqlLoader,
    // queueServiceLoader,
    // schedulerLoader,
    // domainEventsRegisterLoader,
    // sisifLoader,
    // erpLoader,
  ];

  if (env.loaders.winstonEnabled) {
    const { winstonLoader } = await import(
      /* webpackChunkName: "winstonLoader" */ './loaders/winstonLoader'
    );
    loaders.push(winstonLoader);
  }

  if (env.loaders.knexEnabled) {
    const { knexLoader } = await import(
      /* webpackChunkName: "knexLoader" */ './loaders/knexLoader'
    );
    loaders.push(knexLoader);
  }

  if (env.loaders.contextEnabled) {
    const { contextLoader } = await import(
      /* webpackChunkName: "contextLoader" */ './loaders/contextLoader'
    );
    loaders.push(contextLoader);
  }

  if (env.loaders.expressEnabled) {
    const { expressLoader } = await import(
      /* webpackChunkName: "expressLoader" */ './loaders/expressLoader'
    );
    loaders.push(expressLoader);
  }

  // import { monitorLoader } from './loaders/monitorLoader';
  // import { graphqlLoader } from './loaders/graphqlLoader';
  // import { queueServiceLoader } from './loaders/queueServiceLoader';
  // import { schedulerLoader } from './loaders/schedulerLoader';
  // import { domainEventsRegisterLoader } from './loaders/domainEventsLoader';
  // import { sisifLoader } from './loaders/sisifLoader';

  if (env.loaders.erpEnabled) {
    const { erpLoader } = await import(
      /* webpackChunkName: "erpLoader" */ './loaders/erpLoader'
    );
    loaders.push(erpLoader);
  }

  await bootstrapMicroframework({
    /**
     * Loader is a place where you can configure all your modules during microframework
     * bootstrap process. All loaders are executed one by one in a sequential order.
     */
    loaders,
  })
    .then(() => banner(log))
    .catch((error) => {
      log.error('Application crashed', error);
      process.exit(1);
    });
}

main();
