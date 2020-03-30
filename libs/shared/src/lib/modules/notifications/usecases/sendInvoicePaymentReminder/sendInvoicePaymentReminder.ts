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

import {
  SchedulingTime,
  SisifJobTypes,
  TimerBuilder,
  JobBuilder
} from '@hindawi/sisif';

import { InvoiceReminderPayload } from '../../../../infrastructure/message-queues/payloads';
import { SchedulerContract } from '../../../../infrastructure/scheduler/Scheduler';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import {
  PaymentReminderType,
  EmailService
} from '../../../../infrastructure/communication-channels';

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { CatalogRepoContract } from '../../../journals/repos/catalogRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetSentNotificationForInvoiceUsecase } from '../getSentNotificationForInvoice';
import { GetJournal } from '../../../journals/usecases/journals/getJournal/getJournal';
import { AreNotificationsPausedUsecase } from '../areNotificationsPaused';

import { NotificationType, Notification } from '../../domain/Notification';
import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';

// * Usecase specific
import { SendInvoicePaymentReminderResponse as Response } from './sendInvoicePaymentReminderResponse';
import { SendInvoicePaymentReminderErrors as Errors } from './sendInvoicePaymentReminderErrors';
import { SendInvoicePaymentReminderDTO as DTO } from './sendInvoicePaymentReminderDTO';

import {
  constructPaymentReminderData,
  numberToTemplateMapper,
  CompoundData
} from './utils';

type Context = AuthorizationContext<Roles>;
export type SendInvoicePaymentReminderContext = Context;

export class SendInvoicePaymentReminderUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private sentNotificationRepo: SentNotificationRepoContract,
    private pausedReminderRepo: PausedReminderRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private journalRepo: CatalogRepoContract,
    private loggerService: LoggerContract,
    private scheduler: SchedulerContract,
    private emailService: EmailService
  ) {
    this.sendPaymentReminderEmail = this.sendPaymentReminderEmail.bind(this);
    this.fetchFromManuscriptsDb = this.fetchFromManuscriptsDb.bind(this);
    this.bellowEmailMaxCount = this.bellowEmailMaxCount.bind(this);
    this.shouldRescheduleJob = this.shouldRescheduleJob.bind(this);
    this.saveNotification = this.saveNotification.bind(this);
    this.scheduleNextJob = this.scheduleNextJob.bind(this);
    this.shouldSendEmail = this.shouldSendEmail.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.getCatalogItem = this.getCatalogItem.bind(this);
    this.getPauseStatus = this.getPauseStatus.bind(this);
    this.getManuscript = this.getManuscript.bind(this);
    this.getInvoice = this.getInvoice.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.getInvoice(context))
        .then(this.getCatalogItem(context))
        .then(this.getPauseStatus(context))
        .advanceOrEnd(this.shouldSendEmail, this.bellowEmailMaxCount)
        .then(this.sendPaymentReminderEmail)
        .then(this.saveNotification)
        .advanceOrEnd(this.shouldRescheduleJob)
        .then(this.scheduleNextJob)
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

      const execution = new AsyncEither<null, string>(
        request.manuscriptCustomId
      )
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

  private async fetchFromManuscriptsDb(customId: string) {
    try {
      const result = await this.manuscriptRepo.findByCustomId(customId);
      if (result) {
        return right<Errors.ManuscriptNotFound, Manuscript>(result);
      } else {
        return left<Errors.ManuscriptNotFound, Manuscript>(
          new Errors.ManuscriptNotFound(customId)
        );
      }
    } catch (e) {
      return left<Errors.ManuscriptNotFound, Manuscript>(
        new Errors.ManuscriptNotFound(customId)
      );
    }
  }

  private getManuscript(request: DTO & { invoice: Invoice }) {
    this.loggerService.info(
      `Get manuscript with custom id ${request.manuscriptCustomId}`
    );

    const execution = new AsyncEither<null, string>(request.manuscriptCustomId)
      .then(this.fetchFromManuscriptsDb)
      .map(manuscript => ({ ...request, manuscript }));
    return execution.execute();
  }

  private getCatalogItem(context: Context) {
    return async (
      request: DTO & { invoice: Invoice; manuscript: Manuscript }
    ) => {
      this.loggerService.info(
        `Get the journal data for manuscript with custom id ${request.manuscriptCustomId}`
      );

      const journalExecution = async (manuscript: Manuscript) =>
        getJournalUsecase.execute({ journalId: manuscript.journalId }, context);
      const getJournalUsecase = new GetJournal(this.journalRepo);
      const execution = new AsyncEither(request)
        .then(this.getManuscript)
        .map(data => data.manuscript)
        .then(journalExecution)
        .map(journalResult => ({
          ...request,
          journal: journalResult.getValue()
        }));
      return execution.execute();
    };
  }

  private bellowEmailMaxCount({ invoice }: CompoundData) {
    this.loggerService.info(
      `Determine if the reminder of type ${
        NotificationType.REMINDER_PAYMENT
      } was sent less than 3 times for invoice with id ${invoice.id.toString()}`
    );

    const getNotificationsUsecase = new GetSentNotificationForInvoiceUsecase(
      this.sentNotificationRepo,
      this.invoiceRepo,
      this.loggerService
    );
    const filterPayment = (notification: Notification) =>
      notification.type === NotificationType.REMINDER_PAYMENT;

    const execution = new AsyncEither(invoice.id.toString())
      .then(invoiceId => getNotificationsUsecase.execute({ invoiceId }))
      .map(result => result.getValue())
      .map(notifications => notifications.filter(filterPayment))
      .map(notifications => notifications.length)
      .map(count => count < 3);

    return execution.execute();
  }

  private async sendEmail(
    request: CompoundData,
    template: PaymentReminderType
  ): Promise<Either<Errors.EmailSendingFailure, CompoundData>> {
    this.loggerService.info(
      `Send the reminder email for invoice with id ${request.invoice.id.toString()}, to "${
        request.recipientEmail
      }", with ${template} template`
    );

    if (!template) {
      return left(
        new AppError.UnexpectedError(
          'Invalid email template has been tried to send'
        )
      );
    }

    try {
      const emailData = constructPaymentReminderData(request);
      await this.emailService
        .invoicePaymentReminder(emailData, template)
        .sendEmail();

      return right(request);
    } catch (e) {
      return left(new Errors.EmailSendingFailure(e));
    }
  }

  private sendPaymentReminderEmail(request: CompoundData) {
    const passedTime =
      new Date().getTime() - request.invoice.dateIssued.getTime();
    const period = request.job.delay * SchedulingTime.Day;
    const emailNum = Math.trunc(passedTime / period);

    return this.sendEmail(request, numberToTemplateMapper[emailNum]);
  }

  private getPauseStatus(context: Context) {
    return async (request: CompoundData) => {
      this.loggerService.info(
        `Get the paused status of reminders of type ${
          NotificationType.REMINDER_PAYMENT
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
          notificationType: NotificationType.REMINDER_PAYMENT,
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

  private async saveNotification(
    request: CompoundData
  ): Promise<Either<Errors.NotificationDbSaveError, CompoundData>> {
    this.loggerService.info(
      `Save that a reminder of type ${
        NotificationType.REMINDER_PAYMENT
      } was sent, for invoice with id ${request.invoice.id.toString()}`
    );

    const notification = Notification.create({
      type: NotificationType.REMINDER_PAYMENT,
      recipientEmail: request.recipientEmail,
      invoiceId: request.invoice.invoiceId
    }).getValue();

    try {
      await this.sentNotificationRepo.addNotification(notification);

      return right(request);
    } catch (e) {
      return left(new Errors.NotificationDbSaveError(e));
    }
  }

  private async scheduleNextJob(
    request: CompoundData
  ): Promise<Either<Errors.RescheduleTaskFailed, CompoundData>> {
    this.loggerService.info(
      `Reschedule the job for sending a reminder of type ${NotificationType.REMINDER_PAYMENT}, in ${request.job.delay} days`
    );

    const { job: jobData } = request;
    const data: InvoiceReminderPayload = {
      manuscriptCustomId: request.manuscriptCustomId,
      recipientEmail: request.recipientEmail,
      recipientName: request.recipientName
    };

    const timer = TimerBuilder.delayed(jobData.delay, SchedulingTime.Day);
    const newJob = JobBuilder.basic(SisifJobTypes.InvoicePaymentReminder, data);

    try {
      await this.scheduler.schedule(newJob, jobData.queueName, timer);
      return right(request);
    } catch (e) {
      return left(new Errors.RescheduleTaskFailed(e));
    }
  }

  private async shouldSendEmail({ invoice, paused, job }: CompoundData) {
    this.loggerService.info(
      `Determine if the reminder, of type ${
        NotificationType.REMINDER_CONFIRMATION
      }, should be sent for invoice with id ${invoice.id.toString()}`
    );

    const passedTime = new Date().getTime() - invoice.dateIssued.getTime();
    const period = job.delay * SchedulingTime.Day;

    if (
      invoice.status === InvoiceStatus.ACTIVE &&
      passedTime <= 3.2 * period &&
      !paused
    ) {
      return right<null, boolean>(true);
    }

    return right<null, boolean>(false);
  }

  private async shouldRescheduleJob({ invoice, job }: CompoundData) {
    this.loggerService.info(
      `Determine if the reminder, of type ${
        NotificationType.REMINDER_CONFIRMATION
      }, should be rescheduled for invoice with id ${invoice.id.toString()}`
    );

    const passedTime = new Date().getTime() - invoice.dateIssued.getTime();
    const period = job.delay * SchedulingTime.Day;

    if (passedTime >= 3 * period) {
      return right<null, boolean>(false);
    }

    return right<null, boolean>(true);
  }
}
