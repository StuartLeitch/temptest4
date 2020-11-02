import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { LoggerContract, LoggerBuilder } from '@hindawi/shared';
import { Job } from '@hindawi/sisif';

import { SisifHandlers } from '../sisif';
import { Context } from '../builders';
import { env } from '../env';

const loggerBuilder = new LoggerBuilder();
const sisifLogger = loggerBuilder.getLogger();
sisifLogger.setScope('sisif:loader');

function jobHandlerDispatcher(context: Context, loggerService: LoggerContract) {
  return (job: Job) => {
    const { data, type } = job;

    try {
      SisifHandlers.get(type)(data, context, loggerService);
    } catch (e) {
      sisifLogger.error(
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
      services: { schedulingService, logger: loggerService },
    } = context;

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
