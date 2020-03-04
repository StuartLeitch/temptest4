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

import { SchedulerContract } from '../../../../infrastructure/scheduler/Scheduler';
import { EmailService } from '../../../../infrastructure/communication-channels';
import { delayedTimer, SchedulingTime, makeJob } from '@hindawi/sisif';

import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { NotificationType, Notification } from '../../domain/Notification';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { Invoice } from '../../../invoices/domain/Invoice';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';

// * Usecase specific
import { SendInvoiceConfirmationReminderResponse as Response } from './SendInvoiceConfirmationReminderResponse';
import { SendInvoiceConfirmationReminderErrors as Errors } from './SendInvoiceConfirmationReminderErrors';
import { SendInvoiceConfirmationReminderDTO as DTO } from './SendInvoiceConfirmationReminderDTO';

type Context = AuthorizationContext<Roles>;
export type SendInvoiceConfirmationReminderContext = Context;

export class SendInvoiceConfirmationReminderUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private sentNotificationRepo: SentNotificationRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private scheduler: SchedulerContract,
    private emailService: EmailService
  ) {
    this.decideOnSideEffects = this.decideOnSideEffects.bind(this);
    this.performSideEffects = this.performSideEffects.bind(this);
    this.saveNotification = this.saveNotification.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
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
        .then(this.getInvoice)
        .then(this.decideOnSideEffects(request));

      const maybeResult = await execution.execute();
      return maybeResult.map(val => Result.ok(val));
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }

  private async validateRequest(request: DTO) {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }
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

  private decideOnSideEffects(request: DTO) {
    return async (invoice: Invoice) => {
      if (invoice.dateAccepted && !invoice.dateIssued) {
        return this.performSideEffects(request);
      }
      return right<null, null>(null);
    };
  }

  private async getInvoice({ invoiceId }: DTO) {
    const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const maybeResult = await invoiceUsecase.execute({ invoiceId });
    return maybeResult.map(result => result.getValue());
  }

  private async performSideEffects(request: DTO) {
    return new AsyncEither<null, DTO>(request)
      .then(this.sendEmail)
      .then(this.saveNotification)
      .then(this.scheduleTask)
      .execute();
  }

  private async sendEmail(
    request: DTO
  ): Promise<Either<Errors.EmailSendingFailure, DTO>> {
    try {
      const result = await this.emailService
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
          invoiceId: request.invoiceId
        })
        .sendEmail();
      return right(request);
    } catch (e) {
      return left(new Errors.EmailSendingFailure(e));
    }
  }

  private async saveNotification(
    request: DTO
  ): Promise<Either<Errors.NotificationDbSaveError, DTO>> {
    try {
      const invoiceUUID = new UniqueEntityID(request.invoiceId);
      const invoiceId = InvoiceId.create(invoiceUUID).getValue();
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
    const { job: jobData } = request;
    const data = {
      manuscriptCustomId: request.manuscriptCustomId,
      recipientEmail: request.recipientEmail,
      recipientName: request.recipientName,
      senderEmail: request.senderEmail,
      senderName: request.senderName,
      invoiceId: request.invoiceId
    };

    const timer = delayedTimer(jobData.delay, SchedulingTime.Day);
    const newJob = makeJob(jobData.type, data);

    try {
      await this.scheduler.schedule(newJob, jobData.queName, timer);
      return right(null);
    } catch (e) {
      return left(new Errors.RescheduleTaskFailed(e));
    }
  }
}
