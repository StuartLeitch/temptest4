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

        if (event === 'ERPRevenueRecognitionRegistration') {
          queue._LOCAL_ = {
            event,
            handler: handler.bind(context),
          };
        }

        queue.registerEventHandler({
          event,
          handler: handler(context),
        });
      });
      queue.start();

      await queue._LOCAL_.handler(context)({
        invoiceId: '3acf2fb0-285c-4eec-b78e-29739759e22a',
      });
    }
  }
};
