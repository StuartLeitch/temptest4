import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { executionContext } from '@hindawi/shared';

import { Context } from '../builders';

import { env } from '../env';

import * as eventHandlers from '../queue_service/handlers';

export const queueServiceLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && env.aws.enabled) {
    const context: Context = settings.getData('context');

    const queue = context?.services?.queue;

    if (queue) {
      Object.keys(eventHandlers).forEach((eventHandler: string) => {
        const { handler, event } = eventHandlers[eventHandler];

        queue.registerEventHandler({
          event,
          handler: executionContext.wrapQueueHandler(handler(context)),
        });
      });
      queue.start();
    }
  }
};
