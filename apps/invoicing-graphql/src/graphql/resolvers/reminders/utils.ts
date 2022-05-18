import {
  PauseInvoiceConfirmationRemindersUsecase,
  ResumeInvoiceConfirmationReminderUsecase,
  PauseInvoicePaymentRemindersUsecase,
  ResumeInvoicePaymentReminderUsecase,
  UsecaseAuthorizationContext,
} from '@hindawi/shared';

import { Context } from '../../../builders';

import { env } from '../../../env';

export async function pauseOrResumeConfirmation(
  invoiceId: string,
  state: boolean,
  context: Context,
  usecaseContext: UsecaseAuthorizationContext
) {
  const {
    repos: { pausedReminder, invoiceItem, transaction, manuscript, invoice },
    services: { schedulingService },
    loggerBuilder,
  } = context;

  const loggerService = loggerBuilder.getLogger('pauseOrResumeConfirmation');

  if (state == true) {
    const pauseUsecase = new PauseInvoiceConfirmationRemindersUsecase(
      pausedReminder,
      invoice,
      loggerService
    );
    return pauseUsecase.execute(
      {
        invoiceId,
      },
      usecaseContext
    );
  } else {
    const resumeUsecase = new ResumeInvoiceConfirmationReminderUsecase(
      pausedReminder,
      invoiceItem,
      transaction,
      manuscript,
      invoice,
      loggerService,
      schedulingService
    );
    return resumeUsecase.execute(
      {
        reminderDelay: env.scheduler.confirmationReminderDelay,
        queueName: env.scheduler.emailRemindersQueue,
        invoiceId,
      },
      usecaseContext
    );
  }
}

export async function pauseOrResumePayment(
  invoiceId: string,
  state: boolean,
  context: Context,
  usecaseContext: UsecaseAuthorizationContext
) {
  const {
    repos: { pausedReminder, transaction, invoice, payer },
    services: { schedulingService },
    loggerBuilder,
  } = context;

  const loggerService = loggerBuilder.getLogger('pauseOrResumePayment');

  if (state == true) {
    const pauseUsecase = new PauseInvoicePaymentRemindersUsecase(
      pausedReminder,
      invoice,
      loggerService
    );
    return pauseUsecase.execute(
      {
        invoiceId,
      },
      usecaseContext
    );
  } else {
    const resumeUsecase = new ResumeInvoicePaymentReminderUsecase(
      pausedReminder,
      transaction,
      invoice,
      payer,
      loggerService,
      schedulingService
    );
    return resumeUsecase.execute(
      {
        reminderDelay: env.scheduler.paymentReminderDelay,
        queueName: env.scheduler.emailRemindersQueue,
        invoiceId,
      },
      usecaseContext
    );
  }
}
