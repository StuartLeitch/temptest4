import { bootstrapMicroframework } from 'microframework-w3tec';
import 'reflect-metadata';

import { LoggerBuilder, LogLevel } from '@hindawi/shared';

import { banner } from './lib/banner';
import { env } from './env';
/**
 * EXPRESS TYPESCRIPT BOILERPLATE
 * ----------------------------------------
 *
 * This is a boilerplate for Node.js Application written in TypeScript.
 * The basic layer of this app is express. For further information visit
 * the 'README.md' file.
 */

const log = new LoggerBuilder(LogLevel[env.log.level]).getLogger('loader');

async function main() {
  /**
   * Loaders
   */
  const loaders = [];
  const { expressLoader } = await import(
    /* webpackChunkName: "expressLoader" */ './loaders/expressLoader'
  );
  log.info('Express Server initiated ✔️');
  loaders.push(expressLoader);

  const { knexLoader } = await import(
    /* webpackChunkName: "knexLoader" */ './loaders/knexLoader'
  );
  log.info('Knex Query Builder initiated ✔️');
  loaders.push(knexLoader);

  const { contextLoader } = await import(
    /* webpackChunkName: "graphqlLoader" */ './loaders/contextLoader'
  );
  log.info('Application context initiated ✔ ');
  loaders.push(contextLoader);

  const { graphqlLoader } = await import(
    /* webpackChunkName: "graphqlLoader" */ './loaders/graphqlLoader'
  );
  log.info('GraphQL Server initiated ✔️');
  loaders.push(graphqlLoader);

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
