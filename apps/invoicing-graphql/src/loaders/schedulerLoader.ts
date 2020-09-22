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

import { RetryFailedSageErpInvoicesUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/ERP/retryFailedSageErpInvoices/retryFailedSageErpInvoices';
import { RetryFailedNetsuiteErpInvoicesUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/ERP/retryFailedNetsuiteErpInvoices/retryFailedNetsuiteErpInvoices';
import { RetryRevenueRecognitionErpInvoicesUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/ERP/retryRevenueRecognizedErpInvoices/retryRevenueRecognitionErpInvoices';

import { env } from '../env';
import { Logger } from '../lib/logger';
import { Context } from '../builders';

const logger = new Logger();
logger.setScope('scheduler:loader');

export const schedulerLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context: Context = settings.getData('context');
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
      services: {
        erp: { sage: sageService, netsuite: netSuiteService },
        logger: loggerService,
        vatService,
      },
    } = context;
    const {
      failedErpCronRetryTimeMinutes,
      failedErpCronRetryDisabled,
    } = env.app;

    const retryFailedSageErpInvoicesUsecase = new RetryFailedSageErpInvoicesUsecase(
      invoice,
      invoiceItem,
      coupon,
      waiver,
      payer,
      address,
      manuscript,
      catalog,
      sageService,
      publisher,
      loggerService,
      vatService
    );

    const retryFailedNetsuiteErpInvoicesUsecase = new RetryFailedNetsuiteErpInvoicesUsecase(
      invoice,
      invoiceItem,
      coupon,
      waiver,
      payer,
      address,
      manuscript,
      catalog,
      netSuiteService,
      publisher,
      loggerService,
      vatService
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
      sageService,
      netSuiteService,
      loggerService
    );

    // start scheduler
    const jobsQueue = [
      // TODO Describe first job
      async function retryFailedSageErpInvoicesJob() {
        try {
          const maybeResponse = await retryFailedSageErpInvoicesUsecase.execute();
          const response = maybeResponse.value;
          if (maybeResponse.isLeft()) {
            // logger.error(response);
            throw response;
          }
        } catch (err) {
          throw err;
        }
      },
      async function retryFailedNetsuiteErpInvoicesJob() {
        try {
          const maybeResponse = await retryFailedNetsuiteErpInvoicesUsecase.execute();
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
