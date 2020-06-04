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

import { RetryFailedErpInvoicesUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/retryFailedErpInvoices/retryFailedErpInvoices';
import { RetryRevenueRecognitionErpInvoicesUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/retryRevenueRecognizedErpInvoices/retryRevenueRecognitionErpInvoices';

import { env } from '../env';
import { Logger } from '../lib/logger';

const logger = new Logger('scheduler:loader');

export const schedulerLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context = settings.getData('context');
    const {
      repos: {
        invoice,
        invoiceItem,
        manuscript,
        payer,
        address,
        catalog,
        coupon,
        waiver,
        publisher,
      },
      services: { erpService, logger: loggerService },
    } = context;
    const {
      failedErpCronRetryTimeMinutes,
      failedErpCronRetryDisabled,
    } = env.app;

    const retryFailedErpInvoicesUsecase = new RetryFailedErpInvoicesUsecase(
      invoice,
      invoiceItem,
      coupon,
      waiver,
      payer,
      address,
      manuscript,
      catalog,
      erpService,
      publisher,
      loggerService
    );

    const retryRevenueRecognizedInvoicesToErpUsecase = new RetryRevenueRecognitionErpInvoicesUsecase(
      invoice,
      invoiceItem,
      coupon,
      waiver,
      payer,
      address,
      manuscript,
      catalog,
      publisher,
      erpService,
      loggerService
    );

    // start scheduler
    const jobsQueue = [
      // TODO Describe first job
      async function retryFailedErpInvoicesJob() {
        try {
          const maybeResponse = await retryFailedErpInvoicesUsecase.execute();
          const response = maybeResponse.value;
          if (maybeResponse.isLeft()) {
            // logger.error(response);
            throw response;
          }
        } catch (err) {
          throw err;
        }
      },
      // TODO Describe second job
      async function retryRevenueRecognizedInvoicesToErpJob() {
        try {
          const response = await retryRevenueRecognizedInvoicesToErpUsecase.execute();
          if (response.isLeft()) {
            logger.error(response.value.errorValue().message);
            throw response.value.error;
          }
        } catch (err) {
          throw err;
        }
      },
    ];

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
          await head();
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
