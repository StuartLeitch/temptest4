/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { JobData } from '@hindawi/sisif';
import {
  SendInvoiceCreditControlReminderUsecase,
  SendInvoiceCreditControlReminderDTO,
  QueuePayloads,
  Roles,
  LoggerContract,
} from '@hindawi/shared';

import { Context } from '../../builders';
import { env } from '../../env';

export const invoiceCreditControlHandler = (
  payload: JobData<QueuePayloads.InvoiceReminderPayload>,
  appContext: Context,
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
    services: { emailService, logger },
  } = appContext;
  const { recipientEmail, recipientName, invoiceId } = payload;

  const usecase = new SendInvoiceCreditControlReminderUsecase(
    sentNotifications,
    pausedReminder,
    invoiceItem,
    manuscript,
    invoice,
    catalog,
    coupon,
    waiver,
    logger,
    emailService
  );
  const usecaseContext = {
    roles: [Roles.ADMIN],
  };

  const request: SendInvoiceCreditControlReminderDTO = {
    notificationDisabled: env.scheduler.pauseCreditControlReminders,
    creditControlDelay: env.scheduler.creditControlReminderDelay,
    senderEmail: env.app.creditControlReminderSenderEmail,
    senderName: env.app.creditControlReminderSenderName,
    paymentDelay: env.scheduler.paymentReminderDelay,
    recipientEmail,
    recipientName,
    invoiceId,
  };

  usecase
    .execute(request, usecaseContext)
    .then((maybeResult) => {
      if (maybeResult.isLeft()) {
        loggerService.error(
          maybeResult.value.errorValue().message,
          maybeResult.value.errorValue()
        );
      }
    })
    .catch((err) => {
      loggerService.error(err.message, err);
    });
};
