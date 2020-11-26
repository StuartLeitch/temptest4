/* eslint-disable no-useless-catch */
/* eslint-disable no-inner-declarations */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import {
  setIntervalAsync,
  // clearIntervalAsync
} from 'set-interval-async/dynamic';

import { RegisterInvoicesCron } from './../cron/registerInvoicesCron';
import { RegisterInvoicesForSageCron } from './../cron/registerInvoicesForSageCron';
import { RegisterRevenueRecognitionsCron } from './../cron/registerRevenueRecognitionsCron';
import { RegisterRevenueRecognitionsForSageCron } from './../cron/registerRevenueRecognitionsForSageCron';
import { RegisterPaymentsCron } from './../cron/registerPaymentsCron';

import { env } from '../env';
import { Context } from '../builders';

export const schedulerLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context: Context = settings.getData('context');
    const logger = context.loggerBuilder.getLogger();
    logger.setScope('SchedulingService');
    const {
      failedErpCronRetryTimeMinutes,
      failedErpCronRetryDisabled,
    } = env.app;

    const sageJobQueue = [
      RegisterInvoicesForSageCron,
      RegisterRevenueRecognitionsForSageCron,
    ];

    const netSuiteJobQueue = [
      RegisterInvoicesCron,
      RegisterRevenueRecognitionsCron,
      RegisterPaymentsCron,
    ];

    const jobsQueue = [].concat(
      env.netSuite.netSuiteEnabled ? netSuiteJobQueue : [],
      env.salesForce.sageEnabled ? sageJobQueue : []
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
        logger.debug('startProcessing', { job: head.name });
        try {
          await head.schedule(context);
        } catch (err) {
          logger.error('Job Error: ', err);
        }
        logger.debug('doneProcessing', { job: head.name });
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
