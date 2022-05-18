// * Core Domain
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { InvoiceReminderPayload } from '../../../../infrastructure/message-queues/payloads';
import { SchedulerContract } from '../../../../infrastructure/scheduler/Scheduler';
import { EmailService } from '../../../../infrastructure/communication-channels';
import { LoggerContract } from '../../../../infrastructure/logging';
import {
  SisifJobTypes,
  JobBuilder,
} from '../../../../infrastructure/message-queues/contracts/Job';
import {
  SchedulingTime,
  TimerBuilder,
} from '../../../../infrastructure/message-queues/contracts/Time';

import { NotificationType, Notification } from '../../domain/Notification';
import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import {
  TransactionStatus,
  Transaction,
} from '../../../transactions/domain/Transaction';

import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
import { GetTransactionUsecase } from '../../../transactions/usecases/getTransaction/getTransaction';
import { GetSentNotificationForInvoiceUsecase } from '../getSentNotificationForInvoice';
import { AreNotificationsPausedUsecase } from '../areNotificationsPaused';

import { notificationsSentInLastDelay } from '../usecase-utils';

// * Usecase specific
import { SendInvoiceConfirmationReminderResponse as Response } from './sendInvoiceConfirmationReminderResponse';
import type { SendInvoiceConfirmationReminderDTO as DTO } from './sendInvoiceConfirmationReminderDTO';
import * as Errors from './sendInvoiceConfirmationReminderErrors';

interface CompoundDTO extends DTO {
  notificationsSent: Notification[];
  manuscriptCustomId: string;
  transaction: Transaction;
  invoice: Invoice;
  paused: boolean;
}

export class SendInvoiceConfirmationReminderUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(
    private sentNotificationRepo: SentNotificationRepoContract,
    private pausedReminderRepo: PausedReminderRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private loggerService: LoggerContract,
    private scheduler: SchedulerContract,
    private emailService: EmailService
  ) {
    super();

    this.getConfirmationNotificationsSent =
      this.getConfirmationNotificationsSent.bind(this);
    this.noReminderSentRecently = this.noReminderSentRecently.bind(this);
    this.getManuscriptCustomId = this.getManuscriptCustomId.bind(this);
    this.shouldSendReminder = this.shouldSendReminder.bind(this);
    this.saveNotification = this.saveNotification.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.getPauseStatus = this.getPauseStatus.bind(this);
    this.getTransaction = this.getTransaction.bind(this);
    this.scheduleTask = this.scheduleTask.bind(this);
    this.getInvoice = this.getInvoice.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
  }

  @Authorize('reminder:send')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = await new AsyncEither<null, DTO>(request)
        .then(this.validateRequest)
        .then(this.getInvoice(context))
        .then(this.getManuscriptCustomId(context))
        .then(this.getPauseStatus(context))
        .then(this.getTransaction(context))
        .then(this.getConfirmationNotificationsSent(context))
        .advanceOrEnd(this.shouldSendReminder, this.noReminderSentRecently)
        .then(this.sendEmail)
        .then(this.saveNotification)
        .then(this.scheduleTask)
        .map(() => null)
        .execute();

      return execution;
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }

  private async validateRequest(request: DTO) {
    this.loggerService.info(`Validate usecase request data`);

    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }
    if (!request.recipientEmail) {
      return left(new Errors.RecipientEmailRequiredError());
    }
    if (!request.recipientName) {
      return left(new Errors.RecipientNameRequiredError());
    }
    if (!request.senderEmail) {
      return left(new Errors.SenderEmailRequiredError());
    }
    if (!request.senderName) {
      return left(new Errors.SenderNameRequiredError());
    }
    return right<null, DTO>(request);
  }

  private getInvoice(context: Context) {
    return async (request: DTO) => {
      this.loggerService.info(
        `Get the details of invoice with id {${request.invoiceId}}`
      );

      const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
      const { invoiceId } = request;

      const execution = new AsyncEither<null, string>(invoiceId)
        .then((invoiceId) => invoiceUsecase.execute({ invoiceId }, context))
        .map((invoice) => ({
          ...request,
          invoice,
        }));

      return execution.execute();
    };
  }

  private getManuscriptCustomId(context: Context) {
    return async (request: CompoundDTO) => {
      const usecase = new GetManuscriptByInvoiceIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );

      const execution = new AsyncEither<null, string>(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((result) => result[0])
        .map((manuscript) => ({
          ...request,
          manuscriptCustomId: manuscript.customId,
        }));
      return execution.execute();
    };
  }

  private getPauseStatus(context: Context) {
    return async (request: DTO & { invoice: Invoice }) => {
      this.loggerService.info(
        `Get the paused status of reminders of type ${
          NotificationType.REMINDER_CONFIRMATION
        } for invoice with id ${request.invoice.id.toString()}`
      );

      const usecase = new AreNotificationsPausedUsecase(
        this.pausedReminderRepo,
        this.loggerService
      );

      const { invoice } = request;
      const invoiceId = invoice.id.toString();

      const maybeResult = await usecase.execute(
        {
          notificationType: NotificationType.REMINDER_CONFIRMATION,
          invoiceId,
        },
        context
      );

      return maybeResult.map((paused) => ({
        ...request,
        paused,
      }));
    };
  }

  private getTransaction(context: Context) {
    return async (request: CompoundDTO) => {
      this.loggerService.info(
        `Get transaction details for invoice with id ${request.invoice.id.toString()}`
      );

      const usecase = new GetTransactionUsecase(this.transactionRepo);
      const transactionId = request.invoice?.transactionId?.id?.toString();
      try {
        const result = await usecase.execute({ transactionId }, context);

        if (result.isLeft()) {
          return left<
            Errors.CouldNotGetTransactionForInvoiceError,
            CompoundDTO
          >(
            new Errors.CouldNotGetTransactionForInvoiceError(
              request.invoice.id.toString(),
              new Error(result.value.message)
            )
          );
        }

        return right<Errors.CouldNotGetTransactionForInvoiceError, CompoundDTO>(
          {
            ...request,
            transaction: result.value,
          }
        );
      } catch (e) {
        return left<Errors.CouldNotGetTransactionForInvoiceError, CompoundDTO>(
          new Errors.CouldNotGetTransactionForInvoiceError(
            request.invoice.id.toString(),
            e
          )
        );
      }
    };
  }

  private getConfirmationNotificationsSent(context: Context) {
    return async (request: CompoundDTO) => {
      this.loggerService.info(
        `Get the reminders of type ${NotificationType.REMINDER_CONFIRMATION} already sent for the invoice with id {${request.invoiceId}}`
      );

      const getNotificationsUsecase = new GetSentNotificationForInvoiceUsecase(
        this.sentNotificationRepo,
        this.invoiceRepo,
        this.loggerService
      );
      const filterPayment = (notification: Notification) =>
        notification.type === NotificationType.REMINDER_CONFIRMATION;
      const { invoiceId } = request;

      return new AsyncEither(invoiceId)
        .then((invoiceId) =>
          getNotificationsUsecase.execute({ invoiceId }, context)
        )
        .map((notifications) => notifications.filter(filterPayment))
        .map((notificationsSent) => ({
          ...request,
          notificationsSent,
        }))
        .execute();
    };
  }

  private async noReminderSentRecently({
    notificationsSent,
    job: { delay },
  }: CompoundDTO): Promise<Either<null, boolean>> {
    this.loggerService.info(
      `Determine if any reminder of type ${NotificationType.REMINDER_CONFIRMATION} was sent recently and the full delay has not passed yet`
    );

    const recentNotifications = notificationsSentInLastDelay(
      notificationsSent,
      delay
    );

    if (recentNotifications.length > 0) {
      return right(false);
    }

    return right(true);
  }

  private async shouldSendReminder({
    transaction,
    invoice,
    paused,
  }: CompoundDTO) {
    this.loggerService.info(
      `Determine if the reminder, of type ${
        NotificationType.REMINDER_CONFIRMATION
      }, should be sent and rescheduled, for invoice with id ${invoice.id.toString()}`
    );

    if (
      transaction.status === TransactionStatus.ACTIVE &&
      invoice.status === InvoiceStatus.DRAFT &&
      invoice.dateAccepted &&
      !invoice.dateIssued &&
      !paused
    ) {
      return right<null, boolean>(true);
    }

    return right<null, boolean>(false);
  }

  private async sendEmail(
    request: CompoundDTO
  ): Promise<Either<Errors.EmailSendingFailure, DTO>> {
    this.loggerService.info(
      `Send the reminder email for invoice with id ${request.invoice.id.toString()}, to "${
        request.recipientEmail
      }"`
    );

    try {
      await this.emailService
        .invoiceConfirmationReminder({
          author: {
            email: request.recipientEmail,
            name: request.recipientName,
          },
          sender: {
            email: request.senderEmail,
            name: request.senderName,
          },
          articleCustomId: request.manuscriptCustomId,
          invoiceId: request.invoice.id.toString(),
        })
        .sendEmail();
      return right(request);
    } catch (e) {
      return left(new Errors.EmailSendingFailure(e));
    }
  }

  private async saveNotification(
    request: CompoundDTO
  ): Promise<Either<Errors.NotificationDbSaveError, DTO>> {
    this.loggerService.info(
      `Save that a reminder of type ${
        NotificationType.REMINDER_CONFIRMATION
      } was sent, for invoice with id ${request.invoice.id.toString()}`
    );

    try {
      const invoiceId = request.invoice.invoiceId;
      const maybeNotification = Notification.create({
        type: NotificationType.REMINDER_CONFIRMATION,
        recipientEmail: request.recipientEmail,
        invoiceId,
      });

      if (maybeNotification.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeNotification.value.message))
        );
      }

      const maybeResult = await this.sentNotificationRepo.addNotification(
        maybeNotification.value
      );

      if (maybeResult.isLeft()) {
        return left(new UnexpectedError(new Error(maybeResult.value.message)));
      }

      return right(request);
    } catch (e) {
      return left(new Errors.NotificationDbSaveError(e));
    }
  }

  private async scheduleTask(
    request: DTO
  ): Promise<Either<Errors.RescheduleTaskFailed, void>> {
    this.loggerService.info(
      `Reschedule the job for sending a reminder of type ${NotificationType.REMINDER_CONFIRMATION}, in ${request.job.delay} days`
    );

    const { job: jobData } = request;
    const data: InvoiceReminderPayload = {
      recipientEmail: request.recipientEmail,
      recipientName: request.recipientName,
      invoiceId: request.invoiceId,
    };

    const timer = TimerBuilder.delayed(jobData.delay, SchedulingTime.Day);
    const newJob = JobBuilder.basic(SisifJobTypes.InvoiceConfirmReminder, data);

    try {
      await this.scheduler.schedule(newJob, jobData.queueName, timer);
      return right(null);
    } catch (e) {
      return left(new Errors.RescheduleTaskFailed(e));
    }
  }
}
