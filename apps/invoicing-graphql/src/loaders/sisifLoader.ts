import {
  MicroframeworkSettings,
  MicroframeworkLoader
} from 'microframework-w3tec';

import { SchedulingTime, TimerType, Job } from '@hindawi/sisif';

import { SisifHandlers, SisifJobTypes } from '../sisif';

import { env } from '../env';

export const sisifLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context = settings.getData('context');
    const {
      services: { schedulingService }
    } = context;

    // await schedulingService.schedule(
    //   {
    //     type: SisifJobTypes.InvoiceConfirmReminder,
    //     data: {
    //       manuscriptCustomId: '11111111',
    //       recipientEmail: 'rares.stan@hindawi.com',
    //       recipientName: 'Rares Stan'
    //     }
    //   },
    //   env.scheduler.notificationsQueue,
    //   {
    //     kind: TimerType.DelayedTimer,
    //     delay: SchedulingTime.Second
    //   }
    // );

    schedulingService.startListening(
      env.scheduler.notificationsQueue,
      (job: Job) => {
        const { data, type } = job;
        (SisifHandlers[type] || SisifHandlers['default'])(data, context);
      }
    );
  }
};
