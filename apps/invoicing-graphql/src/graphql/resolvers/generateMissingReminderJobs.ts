import {
  ScheduleRemindersForExistingInvoicesUsecase,
  Roles,
} from '@hindawi/shared';

import { Resolvers } from '../schema';
import { Context } from '../../builders';
import { env } from '../../env';

import { handleForbiddenUsecase, getAuthRoles } from './utils';

export const generateMissingReminderJobs: Resolvers<Context> = {
  Mutation: {
    async generateMissingReminderJobs(parent, args, context) {
      const roles = getAuthRoles(context);
      const {
        repos: {
          pausedReminder,
          invoiceItem,
          transaction,
          manuscript,
          invoice,
          payer,
        },
        services: { logger: loggerService, schedulingService },
      } = context;
      const usecaseContext = {
        roles,
      };
      const usecase = new ScheduleRemindersForExistingInvoicesUsecase(
        pausedReminder,
        invoiceItem,
        transaction,
        manuscript,
        invoice,
        payer,
        loggerService,
        schedulingService
      );

      const maybeResult = await usecase.execute(
        {
          creditControlDisabled: env.scheduler.pauseCreditControlReminders,
          creditControlDelay: env.scheduler.creditControlReminderDelay,
          confirmationDelay: env.scheduler.confirmationReminderDelay,
          confirmationQueueName: env.scheduler.emailRemindersQueue,
          paymentQueueName: env.scheduler.emailRemindersQueue,
          paymentDelay: env.scheduler.paymentReminderDelay,
        },
        usecaseContext
      );

      handleForbiddenUsecase(maybeResult);

      if (maybeResult.isLeft()) {
        throw maybeResult.value;
      }

      return 'ok';
    },
  },
};
