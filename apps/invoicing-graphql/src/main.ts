import 'reflect-metadata';
// import * as ES6Promise from 'es6-promise';
import { bootstrapMicroframework } from 'microframework-w3tec';

import { banner } from './lib/banner';
import { Logger } from './lib/logger';
import './lib/logger/LoggerAspect';

import { env } from './env';
// console.info(env);

// ES6Promise.polyfill();

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
  let winstonLoader;
  let contextLoader;
  let knexLoader;
  let expressLoader;
  let erpLoader;

  /**
   * Loaders
   */

  if (env.loaders.winstonEnabled) {
    const winstonImport = await import(
      /* webpackChunkName: "winstonLoader" */ './loaders/winstonLoader'
    );
    winstonLoader = winstonImport.winstonLoader;
  }

  // if (env.loaders.knexEnabled) {
  //   knexLoader = await import(
  //     /* webpackChunkName: "knexLoader" */ './loaders/knexLoader'
  //   );
  // }

  if (env.loaders.contextEnabled) {
    contextLoader = await import(
      /* webpackChunkName: "contextLoader" */ './loaders/contextLoader'
    );
  }

  if (env.loaders.expressEnabled) {
    expressLoader = await import(
      /* webpackChunkName: "expressLoader" */ './loaders/expressLoader'
    );
  }

  // import { monitorLoader } from './loaders/monitorLoader';
  // import { graphqlLoader } from './loaders/graphqlLoader';
  // import { queueServiceLoader } from './loaders/queueServiceLoader';
  // import { schedulerLoader } from './loaders/schedulerLoader';
  // import { domainEventsRegisterLoader } from './loaders/domainEventsLoader';
  // import { sisifLoader } from './loaders/sisifLoader';

  if (env.loaders.erpEnabled) {
    erpLoader = await import(
      /* webpackChunkName: "erpLoader" */ './loaders/erpLoader'
    );
  }

  console.info(winstonLoader);
  process.exit(0);
  // console.info(contextLoader);
  // console.info(expressLoader);
  // console.info(erpLoader);

  await bootstrapMicroframework({
    /**
     * Loader is a place where you can configure all your modules during microframework
     * bootstrap process. All loaders are executed one by one in a sequential order.
     */
    loaders: [
      winstonLoader,
      // knexLoader,
      contextLoader,
      expressLoader,
      // monitorLoader,
      // graphqlLoader,
      // queueServiceLoader,
      // schedulerLoader,
      // domainEventsRegisterLoader,
      // sisifLoader,
      erpLoader,
    ],
  })
    // .then(() => banner(log))
    .catch((error) => {
      log.error('Application crashed', error);
      process.exit(1);
    });
}

main();
