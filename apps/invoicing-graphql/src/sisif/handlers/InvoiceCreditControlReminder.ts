import { JobData } from '@hindawi/sisif';
import {
  SendInvoiceCreditControlReminderUsecase,
  SendInvoiceCreditControlReminderDTO,
  Roles
} from '@hindawi/shared';

import { Logger } from '../../lib/logger';

import { env } from '../../env';

interface Payload {
  manuscriptCustomId: string;
  recipientEmail: string;
  recipientName: string;
}

export const invoiceCreditControlHandler = (
  payload: JobData<Payload>,
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
    services: { emailService }
  } = appContext;
  const { manuscriptCustomId, recipientEmail, recipientName } = payload;

  const usecase = new SendInvoiceCreditControlReminderUsecase(
    sentNotifications,
    pausedReminder,
    invoiceItem,
    manuscript,
    invoice,
    catalog,
    emailService
  );
  const usecaseContext = {
    roles: [Roles.PAYER]
  };

  const request: SendInvoiceCreditControlReminderDTO = {
    senderEmail: env.app.creditControlReminderSenderEmail,
    senderName: env.app.creditControlReminderSenderName,
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
