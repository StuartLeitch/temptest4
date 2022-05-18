import {
  GetRemindersPauseStateForInvoiceUsecase,
  GetSentNotificationForInvoiceUsecase,
} from '@hindawi/shared';

import { Resolvers, ReminderType } from '../../schema';
import { Context } from '../../../builders';

import { pauseOrResumeConfirmation, pauseOrResumePayment } from './utils';

import { handleForbiddenUsecase, getAuthRoles } from '../utils';

export const reminders: Resolvers<Context> = {
  Query: {
    async remindersStatus(parent, args, context) {
      const roles = getAuthRoles(context);
      const { invoiceId } = args;
      const {
        repos: { invoice, pausedReminder },
        loggerBuilder,
      } = context;

      const loggerService = loggerBuilder.getLogger(
        GetRemindersPauseStateForInvoiceUsecase.name
      );

      const usecaseContext = {
        roles,
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

      handleForbiddenUsecase(maybePauseState);

      if (maybePauseState.isLeft()) {
        throw new Error(maybePauseState.value.message);
      }

      return maybePauseState.value;
    },

    async remindersSent(parent, args, context) {
      const roles = getAuthRoles(context);
      const { invoiceId } = args;
      const {
        repos: { invoice, sentNotifications },
        loggerBuilder,
      } = context;

      const loggerService = loggerBuilder.getLogger(
        GetSentNotificationForInvoiceUsecase.name
      );

      const usecaseContext = {
        roles,
      };

      const usecase = new GetSentNotificationForInvoiceUsecase(
        sentNotifications,
        invoice,
        loggerService
      );
      const maybeSentNotifications = await usecase.execute(
        {
          invoiceId,
        },
        usecaseContext
      );

      handleForbiddenUsecase(maybeSentNotifications);

      if (maybeSentNotifications.isLeft()) {
        throw new Error(maybeSentNotifications.value.message);
      }

      return maybeSentNotifications.value.map((reminder) => ({
        type: reminder.type as unknown as ReminderType,
        forInvoice: reminder.invoiceId.id.toString(),
        toEmail: reminder.recipientEmail,
        when: reminder.dateSent,
      }));
    },
  },
  Mutation: {
    async togglePauseConfirmationReminders(parent, args, context) {
      const roles = getAuthRoles(context);
      const { invoiceId, state } = args;
      const {
        repos: { invoice, pausedReminder },
        loggerBuilder,
      } = context;

      const loggerService = loggerBuilder.getLogger(
        GetRemindersPauseStateForInvoiceUsecase.name
      );

      const usecaseContext = {
        roles,
      };

      const getPauseStatusUsecase = new GetRemindersPauseStateForInvoiceUsecase(
        pausedReminder,
        invoice,
        loggerService
      );

      const maybeUpdate = await pauseOrResumeConfirmation(
        invoiceId,
        state,
        context,
        usecaseContext
      );
      const maybeNewPauseState = await getPauseStatusUsecase.execute(
        { invoiceId },
        usecaseContext
      );
      const result = maybeUpdate.chain(() => maybeNewPauseState);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      return result.value;
    },

    async togglePausePaymentReminders(parent, args, context) {
      const roles = getAuthRoles(context);
      const { invoiceId, state } = args;
      const {
        repos: { invoice, pausedReminder },
        loggerBuilder,
      } = context;

      const loggerService = loggerBuilder.getLogger(
        GetRemindersPauseStateForInvoiceUsecase.name
      );

      const usecaseContext = {
        roles,
      };

      const getPauseStatusUsecase = new GetRemindersPauseStateForInvoiceUsecase(
        pausedReminder,
        invoice,
        loggerService
      );

      const maybeUpdate = await pauseOrResumePayment(
        invoiceId,
        state,
        context,
        usecaseContext
      );
      const maybeNewPauseState = await getPauseStatusUsecase.execute(
        { invoiceId },
        usecaseContext
      );
      const result = maybeUpdate.chain(() => maybeNewPauseState);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      return result.value;
    },
  },
};
