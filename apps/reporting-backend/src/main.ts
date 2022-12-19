import { bootstrapMicroframework } from 'microframework-w3tec';

import { banner } from './lib/banner';
import { LoggerBuilder } from 'libs/shared/src/lib/infrastructure/logging/implementations';
import { LogLevel } from 'libs/shared/src/lib/infrastructure/logging';
/**
 * Loaders
 */
import { contextLoader } from './loaders/contextLoader';
import { handlerLoader } from './loaders/handlerLoader';
import { expressLoader } from './loaders/expressLoader';
import { knexLoader } from './loaders/knexLoader';
import { queueServiceLoader } from './loaders/queueServiceLoader';
import { cronLoader } from './loaders/cronLoader';
import { env } from './env';

/**
 * EXPRESS TYPESCRIPT BOILERPLATE
 * ----------------------------------------
 *
 * This is a boilerplate for Node.js Application written in TypeScript.
 * The basic layer of this app is express. For further information visit
 * the 'README.md' file.
 */
const log = new LoggerBuilder(LogLevel[env.log.level]).getLogger(
  'system:loader'
);

bootstrapMicroframework({
  /**
   * Loader is a place where you can configure all your modules during microframework
   * bootstrap process. All loaders are executed one by one in a sequential order.
   */
  loaders: [
    //Moved expess loader to the top to avoid pod restarts due to failed health check during long running deployments that include data refresh!
    expressLoader,
    knexLoader,
    contextLoader,
    handlerLoader,
    queueServiceLoader,
    cronLoader,
  ],
})
  .then(() => banner(log))
  .catch((error) => {
    console.log(error);
    log.error(`Application crashed: ${error}`);
    process.exit(1);
  });
