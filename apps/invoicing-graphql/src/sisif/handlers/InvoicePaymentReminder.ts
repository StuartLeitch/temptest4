import { SisifJobTypes, JobData } from '@hindawi/sisif';
import {
  SendInvoicePaymentReminderUsecase,
  SendInvoicePaymentReminderDTO,
  QueuePayloads,
  Roles
} from '@hindawi/shared';

import { Logger } from '../../lib/logger';

import { env } from '../../env';

export const invoicePaymentHandler = (
  payload: JobData<QueuePayloads.AuthorReminderPayload>,
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
      invoice
    },
    services: { schedulingService, emailService, logger }
  } = appContext;
  const { manuscriptCustomId, recipientEmail, recipientName } = payload;

  const usecase = new SendInvoicePaymentReminderUsecase(
    sentNotifications,
    pausedReminder,
    invoiceItem,
    manuscript,
    invoice,
    catalog,
    logger,
    schedulingService,
    emailService
  );
  const usecaseContext = {
    roles: [Roles.PAYER]
  };

  const request: SendInvoicePaymentReminderDTO = {
    job: {
      delay: env.scheduler.paymentReminderDelay,
      queueName: env.scheduler.emailRemindersQueue,
      type: SisifJobTypes.InvoicePaymentReminder
    },
    senderEmail: env.app.invoicePaymentEmailSenderAddress,
    senderName: env.app.invoicePaymentEmailSenderName,
    manuscriptCustomId,
    recipientEmail,
    recipientName
  };

  usecase.execute(request, usecaseContext).then(maybeResult => {
    if (maybeResult.isLeft()) {
      loggerService.error(maybeResult.value.errorValue().message);
      throw Error(maybeResult.value.errorValue().message);
    }
  });
};
