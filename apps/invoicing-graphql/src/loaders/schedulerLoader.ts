import { setIntervalAsync } from 'set-interval-async/dynamic';
import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { LoggerContract } from '@hindawi/shared';

import {
  RegisterRevenueRecognitionReversalsCron,
  RegisterRevenueRecognitionsCron,
  RegisterCreditNotesCron,
  RegisterInvoicesCron,
  RegisterPaymentsCron,
  Chron,
} from './../cron';

import { Context } from '../builders';
import { env } from '../env';

// * Start scheduler
function processJobsQueue(
  jobsQueue: Array<Chron>,
  context: Context,
  logger: LoggerContract
) {
  return async () => {
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
  };
}

export const schedulerLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context: Context = settings.getData('context');
    const {
      services: { logger: loggerService },
    } = context;
    loggerService.setScope('SchedulingService');
    const { failedErpCronRetryTimeMinutes, failedErpCronRetryDisabled } =
      env.app;

    const netSuiteJobQueue = [
      RegisterInvoicesCron,
      RegisterRevenueRecognitionsCron,
      RegisterCreditNotesCron,
      RegisterPaymentsCron,
      RegisterRevenueRecognitionReversalsCron,
    ];

    const jobsQueue = [].concat(
      env.netSuite.netSuiteEnabled ? netSuiteJobQueue : []
    );

    if (!failedErpCronRetryDisabled) {
      setIntervalAsync(
        processJobsQueue(jobsQueue, context, loggerService),
        failedErpCronRetryTimeMinutes === 0
          ? 15000
          : failedErpCronRetryTimeMinutes * 60 * 1000
      );
    }
  }
};
