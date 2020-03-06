import {
  MicroframeworkSettings,
  MicroframeworkLoader
} from 'microframework-w3tec';

import { Job } from '@hindawi/sisif';

import { SisifHandlers } from '../sisif';
import { Logger } from '../lib/logger';

import { env } from '../env';

const logger = new Logger('sisif:loader');

export const sisifLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context = settings.getData('context');
    const {
      services: { schedulingService, logger: loggerService }
    } = context;

    schedulingService.startListening(
      env.scheduler.notificationsQueue,
      (job: Job) => {
        const { data, type } = job;
        try {
          SisifHandlers.get(type)(data, context, loggerService);
        } catch (e) {
          logger.error(
            `
              Error while handling job of type {${type}}, with data ${data}.
              Got error ${e.message}
            `
          );
          throw e;
        }
      }
    );
  }
};
