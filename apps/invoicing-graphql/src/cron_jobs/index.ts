import { Context } from '../context';
import { PublishInvoiceToErpUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/publishInvoiceToErp/publishInvoiceToErp';
import { RetryFailedErpInvoicesUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/retryFailedErpInvoices/retryFailedErpInvoices';
// import { PublishInvoiceToErpUsecase } from 'libs/shared/src/lib/modules/invoices/usecases/publishInvoiceToErp/publishInvoiceToErp';

type Job = () => Promise<any>;

const config = {
  failedErpTimerInMinutes:
    Number(process.env.FAILED_ERP_CRON_RETRY_TIME_MINUTES) || 15
};

const jobHandles = {};

export const scheduleCronJobs = (context: Context) => {
  const erpRetryJobName = 'InvoiceToErpCronJob';
  const {
    repos: { invoice, invoiceItem, manuscript, payer, address, catalog },
    erpService
  } = context;

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

  if (process.env.FAILED_ERP_CRON_RETRY_TIME_MINUTES !== '0') {
    registerJob(
      async () => {
        console.log(`Starting job: ${erpRetryJobName}`);
        try {
          const response = await retryFailedErpInvoicesUsecase.execute();
          if (response.isLeft()) {
            throw response.value.error;
          }
        } catch (error) {
          console.error(error);
        }
      },
      erpRetryJobName,
      config.failedErpTimerInMinutes
    );
  } else {
    console.log('Skipping cron job', erpRetryJobName);
  }
};

async function registerJob(job: Job, jobName: string, timeInMinutes: number) {
  try {
    await job();
  } catch (error) {}
  jobHandles[jobName] = setInterval(job, timeInMinutes * 60 * 1000);
}
