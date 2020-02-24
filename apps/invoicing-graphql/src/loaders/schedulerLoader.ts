import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import {
  setIntervalAsync
  // clearIntervalAsync
} from 'set-interval-async/dynamic';

import { RetryFailedErpInvoicesUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/retryFailedErpInvoices/retryFailedErpInvoices';
import { RetryRevenueRecognitionErpInvoicesUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/retryRevenueRecognizedErpInvoices/retryRevenueRecognitionErpInvoices';

import { env } from '../env';
import { Logger } from '../lib/logger';

const INVOICE_TO_ERP = Symbol('InvoiceToErpCronJob');
const REVENUE_RECOGNITION_TO_ERP = Symbol('RevenueRecognitionToErpCronJob');

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
        waiver
      },
      services: { erpService, logger: loggerService }
    } = context;
    const { failedErpCronRetryTimeMinutes } = env.app;

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
      erpService,
      loggerService
    );

    // start scheduler
    let jobsQueue = [
      // TODO Describe first job
      // async () => {
      //   try {
      //     const response = await retryFailedErpInvoicesUsecase.execute();
      //     if (response.isLeft()) {
      //       throw response.value.error;
      //     }
      //   } catch (error) {
      //     logger.error(error);
      //   }
      // }
      // TODO Describe second job
      // async () => {
      //   try {
      //     const response = await retryRevenueRecognizedInvoicesToErpUsecase.execute();
      //     if (response.isLeft()) {
      //       throw response.value.error;
      //     }
      //   } catch (error) {
      //     logger.error(error);
      //   }
      // }
    ];

    async function processJobsQueue() {
      if (jobsQueue.length === 0) {
        return;
      }
      const head = jobsQueue[0];
      // console.log(`Processing: ${head.name}.`);
      await head();
      // console.log(`Done processing: ${head.name}.`);
      jobsQueue = jobsQueue.slice(1);
    }

    if (failedErpCronRetryTimeMinutes > -1) {
      setIntervalAsync(
        processJobsQueue,
        failedErpCronRetryTimeMinutes === 0
          ? 1000
          : failedErpCronRetryTimeMinutes * 60 * 1000
      );
    }
  }
};
