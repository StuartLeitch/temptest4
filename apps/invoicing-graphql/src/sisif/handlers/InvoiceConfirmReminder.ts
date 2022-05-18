import { JobData } from '@hindawi/sisif';

import {
  SendInvoiceConfirmationReminderUsecase,
  SendInvoiceConfirmationReminderDTO,
  QueuePayloads,
  Roles,
} from '@hindawi/shared';

import { env } from '../../env';

export const invoiceConfirmHandler = (
  payload: JobData<QueuePayloads.InvoiceReminderPayload>,
  appContext: any
) => {
  const {
    repos: {
      sentNotifications,
      pausedReminder,
      invoiceItem,
      transaction,
      manuscript,
      invoice,
    },
    services: { schedulingService, emailService },
    loggerBuilder,
  } = appContext;
  const { recipientEmail, recipientName, invoiceId } = payload;

  const logger = loggerBuilder.getLogger('InvoiceConfirmationHandler');

  const usecase = new SendInvoiceConfirmationReminderUsecase(
    sentNotifications,
    pausedReminder,
    invoiceItem,
    transaction,
    manuscript,
    invoice,
    logger,
    schedulingService,
    emailService
  );
  const usecaseContext = {
    roles: [Roles.CHRON_JOB],
  };

  const request: SendInvoiceConfirmationReminderDTO = {
    job: {
      delay: env.scheduler.confirmationReminderDelay,
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
        logger.error(maybeResult.value.message, maybeResult.value);
      }
    })
    .catch((err) => {
      logger.error(err.message, err);
    });
};
