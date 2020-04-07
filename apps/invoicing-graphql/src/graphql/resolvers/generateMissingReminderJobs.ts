import {
  ScheduleRemindersForExistingInvoicesUsecase,
  Roles,
} from '@hindawi/shared';

import { Resolvers } from '../schema';

import { env } from '../../env';

export const generateMissingReminderJobs: Resolvers<any> = {
  Mutation: {
    async generateMissingReminderJobs(parent, args, context) {
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
        roles: [Roles.ADMIN],
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
          creditControlDelay: env.scheduler.creditControlReminderDelay,
          confirmationDelay: env.scheduler.confirmationReminderDelay,
          confirmationQueueName: env.scheduler.emailRemindersQueue,
          paymentQueueName: env.scheduler.emailRemindersQueue,
          paymentDelay: env.scheduler.paymentReminderDelay,
        },
        usecaseContext
      );

      if (maybeResult.isLeft()) {
        throw maybeResult.value.errorValue();
      }

      return 'ok';
    },
  },
};
