import 'reflect-metadata';
import { bootstrapMicroframework } from 'microframework-w3tec';

import { banner } from './lib/banner';

import { env } from './env';
import { LoggerBuilder } from '@hindawi/shared';

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

  if (env.loaders.expressEnabled) {
    const { expressLoader } = await import(
      /* webpackChunkName: "expressLoader" */ './loaders/expressLoader'
    );
    log.info('Express Server initiated ✔️');
    loaders.push(expressLoader);
  }

  if (env.loaders.monitorEnabled) {
    const { monitorLoader } = await import(
      /* webpackChunkName: "monitorLoader" */ './loaders/monitorLoader'
    );
    log.info('Express Monitor initiated ✔️');
    loaders.push(monitorLoader);
  }

  if (env.loaders.graphqlEnabled) {
    const { graphqlLoader } = await import(
      /* webpackChunkName: "graphqlLoader" */ './loaders/graphqlLoader'
    );
    log.info('GraphQL Server initiated ✔️');
    loaders.push(graphqlLoader);
  }

  if (env.loaders.erpEnabled) {
    const { erpLoader } = await import(
      /* webpackChunkName: "erpLoader" */ './loaders/erpLoader'
    );
    log.info('ERP integration initiated ✔️');
    loaders.push(erpLoader);
  }

  if (env.loaders.queueServiceEnabled) {
    const { queueServiceLoader } = await import(
      /* webpackChunkName: "queueServiceLoader" */ './loaders/queueServiceLoader'
    );
    log.info('Queue Service initiated ✔️');
    loaders.push(queueServiceLoader);
  }

  if (env.loaders.schedulerEnabled) {
    // import { schedulerLoader } from './loaders/schedulerLoader';
    const { schedulerLoader } = await import(
      /* webpackChunkName: "schedulerLoader" */ './loaders/schedulerLoader'
    );
    log.info('Scheduler initiated ✔️');
    loaders.push(schedulerLoader);
  }

  if (env.loaders.domainEventsRegisterEnabled) {
    // import { domainEventsRegisterLoader } from './loaders/domainEventsLoader';
    const { domainEventsRegisterLoader } = await import(
      /* webpackChunkName: "domainEventsRegisterLoader" */ './loaders/domainEventsLoader'
    );
    log.info('Domain Events initiated ✔️');
    loaders.push(domainEventsRegisterLoader);
  }

  if (env.loaders.sisifEnabled) {
    // import { sisifLoader } from './loaders/sisifLoader';
    const { sisifLoader } = await import(
      /* webpackChunkName: "sisifLoader" */ './loaders/sisifLoader'
    );
    log.info('Sisif service initiated ✔️');
    loaders.push(sisifLoader);
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
