import {
  MicroframeworkSettings,
  MicroframeworkLoader
} from 'microframework-w3tec';

import { Job } from '@hindawi/sisif';

import { SisifHandlers } from '../sisif';

import { env } from '../env';

export const sisifLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context = settings.getData('context');
    const {
      services: { schedulingService }
    } = context;

    schedulingService.startListening(
      env.scheduler.notificationsQueue,
      (job: Job) => {
        const { data, type } = job;
        (SisifHandlers[type] || SisifHandlers['default'])(data, context);
      }
    );
  }
};
