import 'reflect-metadata';
import { bootstrapMicroframework } from 'microframework-w3tec';

import { env } from './env';
import { LoggerBuilder } from '@hindawi/shared';

/**
 * EXPRESS TYPESCRIPT BOILERPLATE
 * ----------------------------------------
 *
 * This is a boilerplate for Node.js Application written in TypeScript.
 * The basic layer of this app is express. For further information visit
 * the 'README.md' file.
 */
const log = new LoggerBuilder('loader', {
  logLevel: env.log.level,
  isDevelopment: env.isDevelopment,
}).getLogger();

async function main() {
  /**
   * Loaders
   */
  const loaders = [];

  if (env.loaders.knexEnabled) {
    const { knexLoader } = await import(
      /* webpackChunkName: "knexLoader" */ './loaders/knexLoader'
    );
    log.info('Knex Query Builder initiated ✔️');
    loaders.push(knexLoader);
  }

  if (env.loaders.contextEnabled) {
    const { contextLoader } = await import(
      /* webpackChunkName: "contextLoader" */ './loaders/contextLoader'
    );
    log.info('Context state object initiated ✔️');
    loaders.push(contextLoader);
  }

  if (env.loaders.queueServiceEnabled) {
    const { queueServiceLoader } = await import(
      /* webpackChunkName: "queueServiceLoader" */ './loaders/queueServiceLoader'
    );
    log.info('Queue Service initiated ✔️');
    loaders.push(queueServiceLoader);
  }

  if (env.loaders.erpEnabled) {
    const { erpLoader } = await import(
      /* webpackChunkName: "erpLoader" */ './loaders/erpLoader'
    );
    log.info('ERP integration initiated ✔️');
    loaders.push(erpLoader);
  }

  await bootstrapMicroframework({
    /**
     * Loader is a place where you can configure all your modules during microframework
     * bootstrap process. All loaders are executed one by one in a sequential order.
     */
    loaders,
  }).catch((error) => {
    log.error('Application crashed', error);
    process.exit(1);
  });
}

main();
