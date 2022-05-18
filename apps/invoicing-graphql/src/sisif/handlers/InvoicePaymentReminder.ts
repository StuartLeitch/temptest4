import { JobData } from '@hindawi/sisif';
import {
  SendInvoicePaymentReminderUsecase,
  SendInvoicePaymentReminderDTO,
  LoggerContract,
  QueuePayloads,
  Roles,
} from '@hindawi/shared';

import { env } from '../../env';

export const invoicePaymentHandler = (
  payload: JobData<QueuePayloads.InvoiceReminderPayload>,
  appContext: any,
  loggerService: LoggerContract
) => {
  const {
    repos: {
      sentNotifications,
      pausedReminder,
      invoiceItem,
      manuscript,
      catalog,
      invoice,
      coupon,
      waiver,
    },
    services: { schedulingService, emailService },
    loggerBuilder,
  } = appContext;
  const { recipientEmail, recipientName, invoiceId } = payload;

  const logger = loggerBuilder.getLogger('InvoicePaymentHandler');

  const usecase = new SendInvoicePaymentReminderUsecase(
    sentNotifications,
    pausedReminder,
    invoiceItem,
    manuscript,
    invoice,
    catalog,
    coupon,
    waiver,
    logger,
    schedulingService,
    emailService
  );
  const usecaseContext = {
    roles: [Roles.CHRON_JOB],
  };

  const request: SendInvoicePaymentReminderDTO = {
    job: {
      delay: env.scheduler.paymentReminderDelay,
      queueName: env.scheduler.emailRemindersQueue,
    },
    senderEmail: env.app.invoicePaymentEmailSenderAddress,
    senderName: env.app.invoicePaymentEmailSenderName,
    recipientEmail,
    recipientName,
    invoiceId,
  };

  usecase
    .execute(request, usecaseContext)
    .then((maybeResult) => {
      if (maybeResult.isLeft()) {
        loggerService.error(maybeResult.value.message, maybeResult.value);
      }
    })
    .catch((err) => {
      loggerService.error(err.message, err);
    });
};
