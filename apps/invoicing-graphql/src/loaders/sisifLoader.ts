import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { LoggerContract } from '@hindawi/shared';
import { Job } from '@hindawi/sisif';

import { SisifHandlers } from '../sisif';
import { Context } from '../builders';
import { env } from '../env';

function jobHandlerDispatcher(context: Context, loggerService: LoggerContract) {
  return (job: Job) => {
    const { data, type } = job;

    try {
      SisifHandlers.get(type)(data, context, loggerService);
    } catch (e) {
      loggerService.error(
        `
          Error while handling job of type {${type}}, with data ${data}.
          Got error ${e.message}
        `
      );
    }
  };
}

export const sisifLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context: Context = settings.getData('context');

    const { sisifEnabled } = env.loaders;
    const {
      services: { schedulingService },
      loggerBuilder,
    } = context;

    const loggerService = loggerBuilder.getLogger('sisifLoader');

    if (sisifEnabled) {
      env.scheduler.notificationsQueues.forEach((queue) => {
        schedulingService.startListening(
          queue,
          jobHandlerDispatcher(context, loggerService)
        );
      });
    }
  }
};
