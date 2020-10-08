import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';

import { env } from '../env';
import { Logger } from '../lib/logger';

import { Context } from '../builders';

import * as eventHandlers from '../queue_service/handlers';

const logger = new Logger();
logger.setScope(__filename);

export const queueServiceLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && env.aws.enabled) {
    const context: Context = settings.getData('context');

    const queue = context?.services?.qq;

    if (queue) {
      Object.keys(eventHandlers).forEach((eventHandler: string) => {
        const { handler, event } = eventHandlers[eventHandler];

        // if (event === 'ArticlePublished') {
        //   queue.__LOCAL__ = {
        //     event,
        //     handler: handler.bind(context),
        //   };
        // }

        queue.registerEventHandler({
          event,
          handler: handler.bind(context),
        });
      });
      queue.start();
    }
  }
};
