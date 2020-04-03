import {
  GetRemindersPauseStateForInvoiceUsecase,
  GetSentNotificationForInvoiceUsecase,
  Roles
} from '@hindawi/shared';

import { Resolvers, ReminderType } from '../../schema';

import { pauseOrResumeConfirmation, pauseOrResumePayment } from './utils';

export const reminders: Resolvers<any> = {
  Query: {
    async remindersStatus(parent, args, context) {
      const { invoiceId } = args;
      const {
        repos: { invoice, pausedReminder },
        services: { logger: loggerService }
      } = context;
      const usecaseContext = {
        roles: [Roles.ADMIN]
      };

      const usecase = new GetRemindersPauseStateForInvoiceUsecase(
        pausedReminder,
        invoice,
        loggerService
      );
      const maybePauseState = await usecase.execute(
        { invoiceId },
        usecaseContext
      );

      if (maybePauseState.isLeft()) {
        throw new Error(maybePauseState.value.errorValue().message);
      }

      return maybePauseState.value.getValue();
    },

    async remindersSent(parent, args, context) {
      const { invoiceId } = args;
      const {
        repos: { invoice, sentNotifications },
        services: { logger: loggerService }
      } = context;
      const usecaseContext = {
        roles: [Roles.ADMIN]
      };

      const usecase = new GetSentNotificationForInvoiceUsecase(
        sentNotifications,
        invoice,
        loggerService
      );
      const maybeSentNotifications = await usecase.execute(
        {
          invoiceId
        },
        usecaseContext
      );

      if (maybeSentNotifications.isLeft()) {
        throw new Error(maybeSentNotifications.value.errorValue().message);
      }

      return maybeSentNotifications.value.getValue().map(reminder => ({
        type: (reminder.type as unknown) as ReminderType,
        forInvoice: reminder.invoiceId.id.toString(),
        toEmail: reminder.recipientEmail,
        when: reminder.dateSent
      }));
    }
  },
  Mutation: {
    async togglePauseConfirmationReminders(parent, args, context) {
      const { invoiceId, state } = args;
      const {
        repos: { invoice, pausedReminder },
        services: { logger: loggerService }
      } = context;

      const usecaseContext = {
        roles: [Roles.ADMIN]
      };

      const getPauseStatusUsecase = new GetRemindersPauseStateForInvoiceUsecase(
        pausedReminder,
        invoice,
        loggerService
      );

      const maybeUpdate = await pauseOrResumeConfirmation(
        invoiceId,
        state,
        context
      );
      const maybeNewPauseState = await getPauseStatusUsecase.execute(
        { invoiceId },
        usecaseContext
      );
      const result = maybeUpdate.chain(() => maybeNewPauseState);

      if (result.isLeft()) {
        throw new Error(result.value.errorValue().message);
      }

      return result.value.getValue();
    },

    async togglePausePaymentReminders(parent, args, context) {
      const { invoiceId, state } = args;
      const {
        repos: { invoice, pausedReminder },
        services: { logger: loggerService }
      } = context;

      const usecaseContext = {
        roles: [Roles.ADMIN]
      };

      const getPauseStatusUsecase = new GetRemindersPauseStateForInvoiceUsecase(
        pausedReminder,
        invoice,
        loggerService
      );

      const maybeUpdate = await pauseOrResumePayment(invoiceId, state, context);
      const maybeNewPauseState = await getPauseStatusUsecase.execute(
        { invoiceId },
        usecaseContext
      );
      const result = maybeUpdate.chain(() => maybeNewPauseState);

      if (result.isLeft()) {
        throw new Error(result.value.errorValue().message);
      }

      return result.value.getValue();
    }
  }
};
