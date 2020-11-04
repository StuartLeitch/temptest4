import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { Context } from '../builders';

import * as eventHandlers from '../queue_service/handlers';
import { Logger } from '../lib/logger';

import { env } from '../env';

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

        queue.registerEventHandler({
          event,
          handler: handler(context),
        });
      });
      queue.start();
    }
  }
};
