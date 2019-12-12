import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';

import { PublishInvoiceToErpUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishInvoiceToErp/publishInvoiceToErp';
import { RetryFailedErpInvoicesUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/retryFailedErpInvoices/retryFailedErpInvoices';

import { env } from '../env';
import { Logger } from '../lib/logger';

type Job = () => Promise<any>;

const jobHandles = {};
const config = {
  failedErpTimerInMinutes: env.app.failedErpCronRetryTimeMinutes || 15
};
const logger = new Logger('scheduler:loader');

export const schedulerLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context = settings.getData('context');
    const {
      repos: { invoice, invoiceItem, manuscript, payer, address, catalog },
      services: { erpService }
    } = context;
    const erpRetryJobName = 'InvoiceToErpCronJob';

    const publishInvoiceToErpUsecase = new PublishInvoiceToErpUsecase(
      invoice,
      invoiceItem,
      payer,
      address,
      manuscript,
      catalog,
      erpService
    );

    const retryFailedErpInvoicesUsecase = new RetryFailedErpInvoicesUsecase(
      invoice,
      publishInvoiceToErpUsecase
    );

    if (env.app.failedErpCronRetryTimeMinutes !== 0) {
      registerJob(
        async () => {
          logger.info('Starting job', erpRetryJobName);
          try {
            const response = await retryFailedErpInvoicesUsecase.execute();
            if (response.isLeft()) {
              throw response.value.error;
            }
          } catch (error) {
            logger.error(error);
          }
        },
        erpRetryJobName,
        config.failedErpTimerInMinutes
      );
    } else {
      logger.warn('Skipping cron job', erpRetryJobName);
    }
  }
};

async function registerJob(job: Job, jobName: string, timeInMinutes: number) {
  try {
    await job();
  } catch (error) {}

  jobHandles[jobName] = setInterval(job, timeInMinutes * 60 * 1000);
}
