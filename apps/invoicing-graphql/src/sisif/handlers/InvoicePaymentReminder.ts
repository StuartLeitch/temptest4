import { SisifJobTypes, JobData } from '@hindawi/sisif';
import {
  SendInvoicePaymentReminderUsecase,
  SendInvoicePaymentReminderDTO,
  Roles
} from '@hindawi/shared';

import { Logger } from '../../lib/logger';

import { env } from '../../env';

interface Payload {
  manuscriptCustomId: string;
  recipientEmail: string;
  recipientName: string;
}

export const invoicePaymentHandler = (
  payload: JobData<Payload>,
  appContext: any,
  loggerService: Logger
) => {
  const {
    repos: { sentNotifications, invoice, manuscript, invoiceItem, catalog },
    services: { schedulingService, emailService }
  } = appContext;
  const { manuscriptCustomId, recipientEmail, recipientName } = payload;

  const usecase = new SendInvoicePaymentReminderUsecase(
    sentNotifications,
    invoiceItem,
    manuscript,
    invoice,
    catalog,
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
