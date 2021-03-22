import { bootstrapMicroframework } from 'microframework-w3tec';

import { banner } from './lib/banner';
import { LoggerBuilder } from 'libs/shared/src/lib/infrastructure/logging/LoggerBuilder';
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
const log = new LoggerBuilder('system:loader', {
  logLevel: env.log.level,
  isDevelopment: env.isDevelopment,
}).getLogger();

bootstrapMicroframework({
  /**
   * Loader is a place where you can configure all your modules during microframework
   * bootstrap process. All loaders are executed one by one in a sequential order.
   */
  loaders: [
    knexLoader,
    // contextLoader,
    // handlerLoader,
    // queueServiceLoader,
    // expressLoader,
    // cronLoader,
  ],
})
  .then(() => banner(log))
  .catch((error) => {
    console.log(error);
    log.error(`Application crashed: ${error}`);
    process.exit(1);
  });
