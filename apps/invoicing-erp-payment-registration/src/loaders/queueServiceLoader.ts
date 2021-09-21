import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { env } from '../env';
import { Context } from '../builders';
import * as eventHandlers from '../queue_service/handlers';

export const queueServiceLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && env.aws.enabled) {
    const context: Context = settings.getData('context');

    const queue = context?.services?.qq;

    if (queue) {
      Object.keys(eventHandlers).forEach((eventHandler: string) => {
        const { handler, event } = eventHandlers[eventHandler];

        // * set local handler
        if (event === 'ERPPaymentRegistration') {
          queue.__LOCAL__ = {
            event,
            handler: handler.bind(context)
          };
        }

        queue.registerEventHandler({
          event,
          handler: handler(context),
        });

      });
      queue.start();

      // * call handler programmatically
      await queue.__LOCAL__.handler(context)({
        paymentId: '9b0641ba-dd40-4754-b815-713420f59e79'
      });

    }
  }
};
