/* eslint-disable no-useless-catch */
/* eslint-disable no-inner-declarations */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';
import { setIntervalAsync } from 'set-interval-async/dynamic';

import { RegisterRevenueRecognitionsCron } from './../cron/registerRevenueRecognitionsCron';
import { RegisterCreditNotesCron } from './../cron/registerCreditNotesCron';
import { RegisterInvoicesCron } from './../cron/registerInvoicesCron';
import { RegisterPaymentsCron } from './../cron/registerPaymentsCron';
import { RegisterRevenueRecognitionReversalsCron } from './../cron/registerRevenueRecognitionsReversalCron';

import { env } from '../env';
import { Context } from '../builders';

export const schedulerLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context: Context = settings.getData('context');
    const {
      services: { logger: loggerService },
    } = context;
    loggerService.setScope('SchedulingService');
    const {
      failedErpCronRetryTimeMinutes,
      failedErpCronRetryDisabled,
    } = env.app;

    const netSuiteJobQueue = [
      // RegisterInvoicesCron,
      RegisterRevenueRecognitionsCron,
      RegisterCreditNotesCron,
      RegisterPaymentsCron,
      RegisterRevenueRecognitionReversalsCron
    ];

    const jobsQueue = [].concat(
      env.netSuite.netSuiteEnabled ? netSuiteJobQueue : []
    );

    // * Start scheduler
    async function processJobsQueue() {
      // * clones the jobs queue
      let queue = [...jobsQueue];

      if (queue.length === 0) {
        return;
      }

      while (queue.length) {
        const head = queue[0];
        loggerService.debug('startProcessing', { job: head.name });
        try {
          await head.schedule(context);
        } catch (err) {
          loggerService.error('Job Error: ', err);
        }
        loggerService.debug('doneProcessing', { job: head.name });
        queue = queue.slice(1);
      }
    }

    if (!failedErpCronRetryDisabled) {
      setIntervalAsync(
        processJobsQueue,
        failedErpCronRetryTimeMinutes === 0
          ? 15000
          : failedErpCronRetryTimeMinutes * 60 * 1000
      );
    }
  }
};
