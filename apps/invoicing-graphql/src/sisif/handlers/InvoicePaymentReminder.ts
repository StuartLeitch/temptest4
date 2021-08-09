import { JobData } from '@hindawi/sisif';
import {
  SendInvoicePaymentReminderUsecase,
  SendInvoicePaymentReminderDTO,
  QueuePayloads,
  Roles,
} from '@hindawi/shared';

import { Logger } from '../../lib/logger';

import { env } from '../../env';

export const invoicePaymentHandler = (
  payload: JobData<QueuePayloads.InvoiceReminderPayload>,
  appContext: any,
  loggerService: Logger
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
    services: { schedulingService, emailService, logger },
  } = appContext;
  const { recipientEmail, recipientName, invoiceId } = payload;

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
