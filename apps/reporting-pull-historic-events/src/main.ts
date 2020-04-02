import 'reflect-metadata';

import { bootstrapMicroframework } from 'microframework-w3tec';

import { banner } from './lib/banner';
import { Logger } from './lib/logger';

/**
 * Loaders
 */
import { contextLoader } from './loaders/contextLoader';
import { winstonLoader } from './loaders/winstonLoader';
import { pullHistoricEventsLoader } from './loaders/pull-historic-events-loader';

const log = new Logger(__filename);

bootstrapMicroframework({
  /**
   * Loader is a place where you can configure all your modules during microframework
   * bootstrap process. All loaders are executed one by one in a sequential order.
   */
  loaders: [winstonLoader, contextLoader, pullHistoricEventsLoader]
})
  .then(() => banner(log))
  .catch(error => {
    console.log(error);
    log.error(`Application crashed: ${error}`);
    process.exit(1);
  });
