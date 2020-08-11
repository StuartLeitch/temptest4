// * Core Domain
import { Either, Result, right, left } from '../../../../core/logic/Result';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { InvoiceReminderPayload } from '../../../../infrastructure/message-queues/payloads';
import { SchedulerContract } from '../../../../infrastructure/scheduler/Scheduler';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import {
  SisifJobTypes,
  JobBuilder,
} from '../../../../infrastructure/message-queues/contracts/Job';
import {
  SchedulingTime,
  TimerBuilder,
} from '../../../../infrastructure/message-queues/contracts/Time';
import {
  PaymentReminderType,
  EmailService,
} from '../../../../infrastructure/communication-channels';

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { CatalogRepoContract } from '../../../journals/repos/catalogRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetItemsForInvoiceUsecase } from '../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
import { GetSentNotificationForInvoiceUsecase } from '../getSentNotificationForInvoice';
import { GetJournal } from '../../../journals/usecases/journals/getJournal/getJournal';
import { AreNotificationsPausedUsecase } from '../areNotificationsPaused';

import { NotificationType, Notification } from '../../domain/Notification';
import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';

import { notificationsSentInLastDelay } from '../usecase-utils';

// * Usecase specific
import { SendInvoicePaymentReminderResponse as Response } from './sendInvoicePaymentReminderResponse';
import { SendInvoicePaymentReminderDTO as DTO } from './sendInvoicePaymentReminderDTO';
import * as Errors from './sendInvoicePaymentReminderErrors';

import {
  constructPaymentReminderData,
  numberToTemplateMapper,
  CompoundData,
} from './utils';

export class SendInvoicePaymentReminderUsecase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private sentNotificationRepo: SentNotificationRepoContract,
    private pausedReminderRepo: PausedReminderRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private journalRepo: CatalogRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private loggerService: LoggerContract,
    private scheduler: SchedulerContract,
    private emailService: EmailService
  ) {
    this.getPaymentNotificationsSent = this.getPaymentNotificationsSent.bind(
      this
    );
    this.sendPaymentReminderEmail = this.sendPaymentReminderEmail.bind(this);
    this.noReminderSentRecently = this.noReminderSentRecently.bind(this);
    this.attachItemsToInvoice = this.attachItemsToInvoice.bind(this);
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
  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    try {
      const execution = new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.getInvoice(context))
        .then(this.attachItemsToInvoice(context))
        .then(this.getManuscript(context))
        .then(this.getCatalogItem(context))
        .then(this.getPauseStatus(context))
        .then(this.getPaymentNotificationsSent(context))
        .advanceOrEnd(
          this.shouldSendEmail,
          this.noReminderSentRecently,
          this.bellowEmailMaxCount
        )
        .then(this.sendPaymentReminderEmail)
        .then(this.saveNotification)
        .advanceOrEnd(this.shouldRescheduleJob)
        .then(this.scheduleNextJob)
        .map(() => Result.ok(null));
      return execution.execute();
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

  private getInvoice(context: UsecaseAuthorizationContext) {
    return async (request: DTO) => {
      this.loggerService.info(
        `Get the details of invoice with id ${request.invoiceId}`
      );

      const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

      const execution = new AsyncEither<null, string>(request.invoiceId)
        .then((invoiceId) => invoiceUsecase.execute({ invoiceId }, context))
        .map((result) => ({
          ...request,
          invoice: result.getValue(),
        }));

      return execution.execute();
    };
  }

  private attachItemsToInvoice(context: UsecaseAuthorizationContext) {
    const usecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );

    return async (request: DTO & { invoice: Invoice }) => {
      const { invoice } = request;
      const execution = new AsyncEither(invoice.id.toString())
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((result) => result.getValue())
        .map((items) => {
          items.forEach((item) => invoice.addInvoiceItem(item));
          return invoice;
        })
        .map((invoice) => ({
          ...request,
          invoice,
        }));
      return execution.execute();
    };
  }

  private getManuscript(context: UsecaseAuthorizationContext) {
    return async (request: DTO & { invoice: Invoice }) => {
      this.loggerService.info(
        `Get manuscript for invoice with id ${request.invoiceId}`
      );

      const usecase = new GetManuscriptByInvoiceIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );
      const execution = new AsyncEither<null, string>(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((response) => response.getValue()[0])
        .map((manuscript) => ({ ...request, manuscript }));
      return execution.execute();
    };
  }

  private getCatalogItem(context: UsecaseAuthorizationContext) {
    return async (
      request: DTO & { invoice: Invoice; manuscript: Manuscript }
    ) => {
      this.loggerService.info(
        `Get the journal data for manuscript with custom id ${request.manuscript.customId}`
      );

      const usecase = new GetJournal(this.journalRepo);
      const execution = new AsyncEither(request.manuscript)
        .map((manuscript) => manuscript.journalId)
        .then((journalId) => usecase.execute({ journalId }, context))
        .map((journalResult) => ({
          ...request,
          journal: journalResult.getValue(),
        }));
      return execution.execute();
    };
  }

  private getPaymentNotificationsSent(context: UsecaseAuthorizationContext) {
    return async (request: CompoundData) => {
      this.loggerService.info(
        `Get the reminders of type ${NotificationType.REMINDER_PAYMENT} already sent for the invoice with id {${request.invoiceId}}`
      );

      const getNotificationsUsecase = new GetSentNotificationForInvoiceUsecase(
        this.sentNotificationRepo,
        this.invoiceRepo,
        this.loggerService
      );
      const filterPayment = (notification: Notification) =>
        notification.type === NotificationType.REMINDER_PAYMENT;
      const { invoiceId } = request;

      return new AsyncEither(invoiceId)
        .then((invoiceId) =>
          getNotificationsUsecase.execute({ invoiceId }, context)
        )
        .map((result) => result.getValue())
        .map((notifications) => notifications.filter(filterPayment))
        .map((notificationsSent) => ({
          ...request,
          notificationsSent,
        }))
        .execute();
    };
  }

  private async bellowEmailMaxCount({
    notificationsSent,
    invoiceId,
  }: CompoundData): Promise<Either<null, boolean>> {
    this.loggerService.info(
      `Determine if the reminder of type ${NotificationType.REMINDER_PAYMENT} was sent less than 3 times for invoice with id ${invoiceId}`
    );

    if (!(notificationsSent.length < 3)) {
      return right(false);
    }

    return right(true);
  }

  private async noReminderSentRecently({
    notificationsSent,
    job: { delay },
  }: CompoundData): Promise<Either<null, boolean>> {
    this.loggerService.info(
      `Determine if any reminder of type ${NotificationType.REMINDER_PAYMENT} was sent recently and the full delay has not passed yet`
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
        new UnexpectedError('Invalid email template has been tried to send')
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

  private getPauseStatus(context: UsecaseAuthorizationContext) {
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
          invoiceId,
        },
        context
      );

      return maybeResult.map((result) => ({
        ...request,
        paused: result.getValue(),
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
      invoiceId: request.invoice.invoiceId,
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
      recipientEmail: request.recipientEmail,
      recipientName: request.recipientName,
      invoiceId: request.invoiceId,
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
