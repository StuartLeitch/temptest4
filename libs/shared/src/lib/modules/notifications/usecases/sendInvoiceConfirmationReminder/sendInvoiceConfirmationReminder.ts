// * Core Domain
import { Either, Result, right, left } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import { SchedulingTime, TimerBuilder, JobBuilder } from '@hindawi/sisif';

import { AuthorReminderPayload } from '../../../../infrastructure/message-queues/payloads';
import { SchedulerContract } from '../../../../infrastructure/scheduler/Scheduler';
import { EmailService } from '../../../../infrastructure/communication-channels';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetTransactionUsecase } from '../../../transactions/usecases/getTransaction/getTransaction';
import { AreNotificationsPausedUsecase } from '../areNotificationsPaused';

import { NotificationType, Notification } from '../../domain/Notification';
import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import {
  STATUS as TransactionStatus,
  Transaction
} from '../../../transactions/domain/Transaction';

// * Usecase specific
import { SendInvoiceConfirmationReminderResponse as Response } from './sendInvoiceConfirmationReminderResponse';
import { SendInvoiceConfirmationReminderErrors as Errors } from './sendInvoiceConfirmationReminderErrors';
import { SendInvoiceConfirmationReminderDTO as DTO } from './sendInvoiceConfirmationReminderDTO';

interface CompoundDTO extends DTO {
  transaction: Transaction;
  invoice: Invoice;
  paused: boolean;
}

type Context = AuthorizationContext<Roles>;
export type SendInvoiceConfirmationReminderContext = Context;

export class SendInvoiceConfirmationReminderUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
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
    this.shouldSendReminder = this.shouldSendReminder.bind(this);
    this.saveNotification = this.saveNotification.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.getPauseStatus = this.getPauseStatus.bind(this);
    this.getTransaction = this.getTransaction.bind(this);
    this.scheduleTask = this.scheduleTask.bind(this);
    this.getInvoice = this.getInvoice.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither<null, DTO>(request)
        .then(this.validateRequest)
        .then(this.getInvoice(context))
        .then(this.getPauseStatus(context))
        .then(this.getTransaction(context))
        .advanceOrEnd(this.shouldSendReminder)
        .then(this.sendEmail)
        .then(this.saveNotification)
        .then(this.scheduleTask)
        .map(() => Result.ok(null));

      return execution.execute();
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }

  private async validateRequest(request: DTO) {
    this.loggerService.info(`Validate usecase request data`);

    if (!request.manuscriptCustomId) {
      return left(new Errors.ManuscriptCustomIdRequiredError());
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
        `Get the details of invoice associated with the manuscript with custom id ${request.manuscriptCustomId}`
      );

      const getInvoiceIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );
      const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
      const { manuscriptCustomId } = request;

      const execution = new AsyncEither<null, string>(manuscriptCustomId)
        .then(customId => getInvoiceIdUsecase.execute({ customId }, context))
        .map(result => result.getValue())
        .map(invoiceIds => invoiceIds[0].id.toString())
        .then(invoiceId => invoiceUsecase.execute({ invoiceId }, context))
        .map(result => ({
          ...request,
          invoice: result.getValue()
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
          invoiceId
        },
        context
      );

      return maybeResult.map(result => ({
        ...request,
        paused: result.getValue()
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

        if (result.isFailure) {
          return left<
            Errors.CouldNotGetTransactionForInvoiceError,
            CompoundDTO
          >(
            new Errors.CouldNotGetTransactionForInvoiceError(
              request.invoice.id.toString(),
              new Error(result.errorValue() as any)
            )
          );
        }

        return right<Errors.CouldNotGetTransactionForInvoiceError, CompoundDTO>(
          {
            ...request,
            transaction: result.getValue()
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

  private async shouldSendReminder({
    transaction,
    invoice,
    paused
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
            name: request.recipientName
          },
          sender: {
            email: request.senderEmail,
            name: request.senderName
          },
          articleCustomId: request.manuscriptCustomId,
          invoiceId: request.invoice.id.toString()
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
      const notification = Notification.create({
        type: NotificationType.REMINDER_CONFIRMATION,
        recipientEmail: request.recipientEmail,
        invoiceId
      }).getValue();

      await this.sentNotificationRepo.addNotification(notification);
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
    const data: AuthorReminderPayload = {
      manuscriptCustomId: request.manuscriptCustomId,
      recipientEmail: request.recipientEmail,
      recipientName: request.recipientName
    };

    const timer = TimerBuilder.delayed(jobData.delay, SchedulingTime.Day);
    const newJob = JobBuilder.basic(jobData.type, data);

    try {
      await this.scheduler.schedule(newJob, jobData.queueName, timer);
      return right(null);
    } catch (e) {
      return left(new Errors.RescheduleTaskFailed(e));
    }
  }
}
