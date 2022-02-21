import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { ValidatePackageHandler } from '../handlers/validation-handler';
import { Context } from '../builders';

import { env } from '../env';

export const queueHandlerLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context: Context = settings.getData('context');

    const queue = context.services.jobQueue;

    const handlers = [];
    handlers.push(ValidatePackageHandler);

    if (queue) {
      Object.values(handlers).forEach((handler) => {
        queue.registerHandler(
          handler.event,
          handler.handler(
            context.services.objectStoreService,
            context.services.archiveService,
            env.zip.saveLocation
          )
        );
      });
      await queue.start();
    }
  }
};
