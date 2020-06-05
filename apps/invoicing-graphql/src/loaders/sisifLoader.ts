import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { LoggerContract } from '@hindawi/shared';
import { Job } from '@hindawi/sisif';

import { SisifHandlers } from '../sisif';
import { Logger } from '../lib/logger';

import { env } from '../env';

const sisifLogger = new Logger();
sisifLogger.setScope('sisif:loader');

function jobHandlerDispatcher(context: any, loggerService: LoggerContract) {
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
      throw e;
    }
  };
}

export const sisifLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context = settings.getData('context');
    const {
      services: { schedulingService, logger: loggerService },
    } = context;

    env.scheduler.notificationsQueues.forEach((queue) => {
      schedulingService.startListening(
        queue,
        jobHandlerDispatcher(context, loggerService)
      );
    });
  }
};
