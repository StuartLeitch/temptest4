import {
  MicroframeworkSettings,
  MicroframeworkLoader
} from 'microframework-w3tec';

import {
  SendInvoiceConfirmationReminderUsecase,
  SendInvoiceConfirmationReminderDTO,
  Roles
} from '@hindawi/shared';
import { SchedulingTime, TimerType, Job } from '@hindawi/sisif';

import { env } from '../env';

export const sisifLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context = settings.getData('context');
    const {
      services: { schedulingService, emailService },
      repos: { sentNotifications, invoice, manuscript, invoiceItem }
    } = context;

    // await schedulingService.schedule(
    //   {
    //     type: 'ConfirmationReminder',
    //     data: {
    //       // invoiceId: '40ec4344-d2c9-48f9-ad82-cbf101b9e9a1',
    //       manuscriptCustomId: '11111111',
    //       recipientEmail: 'rares.stan@hindawi.com',
    //       recipientName: 'Rares Stan'
    //     }
    //   },
    //   env.scheduler.notificationsQueue,
    //   {
    //     kind: TimerType.DelayedTimer,
    //     delay: SchedulingTime.Second
    //   }
    // );

    schedulingService.startListening(
      env.scheduler.notificationsQueue,
      (job: Job) => {
        const {
          data: { data }
        } = job;
        const usecase = new SendInvoiceConfirmationReminderUsecase(
          sentNotifications,
          invoiceItem,
          manuscript,
          invoice,
          schedulingService,
          emailService
        );
        const usecaseContext = {
          roles: [Roles.PAYER]
        };
        const request: SendInvoiceConfirmationReminderDTO = {
          job: {
            delay: env.scheduler.confirmationReminderDelay,
            queName: env.scheduler.notificationsQueue,
            type: 'ConfirmationReminder'
          },
          senderEmail: env.app.invoicePaymentEmailSenderAddress,
          senderName: env.app.invoicePaymentEmailSenderName,
          manuscriptCustomId: data.manuscriptCustomId,
          recipientEmail: data.recipientEmail,
          recipientName: data.recipientName
        };

        usecase.execute(request, usecaseContext).then(maybeResult => {
          if (maybeResult.isLeft()) {
            console.error(maybeResult.value.errorValue());
          }
        });
      }
    );
  }
};
