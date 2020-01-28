import 'reflect-metadata';

import { bootstrapMicroframework } from 'microframework-w3tec';

import { banner } from './lib/banner';
import { Logger } from './lib/logger';

/**
 * Loaders
 */
import { contextLoader } from './loaders/contextLoader';
import { winstonLoader } from './loaders/winstonLoader';
import { knexLoader } from './loaders/knexLoader';
import { queueServiceLoader } from './loaders/queueServiceLoader';
/**
 * EXPRESS TYPESCRIPT BOILERPLATE
 * ----------------------------------------
 *
 * This is a boilerplate for Node.js Application written in TypeScript.
 * The basic layer of this app is express. For further information visit
 * the 'README.md' file.
 */
const log = new Logger(__filename);

bootstrapMicroframework({
  /**
   * Loader is a place where you can configure all your modules during microframework
   * bootstrap process. All loaders are executed one by one in a sequential order.
   */
  loaders: [winstonLoader, knexLoader, contextLoader, queueServiceLoader]
})
  .then(() => banner(log))
  .catch(error => {
    console.log(error);
    log.error(`Application crashed: ${error}`);
    process.exit(1);
  });
