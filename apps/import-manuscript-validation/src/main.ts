import { bootstrapMicroframework } from 'microframework-w3tec';

import { LoggerBuilder, LogLevel } from '@hindawi/shared';

import { banner } from './banner';
import { env } from './env';

const log = new LoggerBuilder(LogLevel[env.log.level]).getLogger('loader');

async function main() {
  const loaders = [];

  const { contextLoader } = await import(
    /* webpackChunkName: "contextLoader" */ './loaders/contextLoader'
  );
  log.info('Application context initiated ✔ ');
  loaders.push(contextLoader);

  const { queueHandlerLoader } = await import(
    /* webpackChunkName: "queue-handlers-loader" */ './loaders/queue-handlers-loader'
  );
  log.info('Queue handlers initiated ✔ ');
  loaders.push(queueHandlerLoader);

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
