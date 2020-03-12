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

import { SchedulerContract } from '../../../../infrastructure/scheduler/Scheduler';
import { EmailService } from '../../../../infrastructure/communication-channels';

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';

import { NotificationType, Notification } from '../../domain/Notification';
import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';

// * Usecase specific
import { SendInvoiceConfirmationReminderResponse as Response } from './sendInvoiceConfirmationReminderResponse';
import { SendInvoiceConfirmationReminderErrors as Errors } from './sendInvoiceConfirmationReminderErrors';
import { SendInvoiceConfirmationReminderDTO as DTO } from './sendInvoiceConfirmationReminderDTO';

interface DTOWithInvoiceId extends DTO {
  invoiceId: string;
}

type Context = AuthorizationContext<Roles>;
export type SendInvoiceConfirmationReminderContext = Context;

export class SendInvoiceConfirmationReminderUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private sentNotificationRepo: SentNotificationRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
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
        .then(this.getInvoice(context))
        .then(this.decideOnSideEffects(request));

      const maybeResult = await execution.execute();
      return maybeResult.map(val => Result.ok(val));
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }

  private async validateRequest(request: DTO) {
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
      if (
        invoice.status === InvoiceStatus.DRAFT &&
        invoice.dateAccepted &&
        !invoice.dateIssued
      ) {
        return this.performSideEffects({
          ...request,
          invoiceId: invoice.id.toString()
        });
      }
      return right<null, null>(null);
    };
  }

  private getInvoice(context: Context) {
    return async ({ manuscriptCustomId }: DTO) => {
      const getInvoiceIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );
      const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

      const execution = new AsyncEither<null, string>(manuscriptCustomId)
        .then(customId => getInvoiceIdUsecase.execute({ customId }, context))
        .map(result => result.getValue())
        .map(invoiceIds => invoiceIds[0].id.toString())
        .then(invoiceId => invoiceUsecase.execute({ invoiceId }, context))
        .map(result => result.getValue());

      return execution.execute();
    };
  }

  private async performSideEffects(request: DTOWithInvoiceId) {
    return new AsyncEither<null, DTO>(request)
      .then(this.sendEmail)
      .then(this.saveNotification)
      .then(this.scheduleTask)
      .execute();
  }

  private async sendEmail(
    request: DTOWithInvoiceId
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
    request: DTOWithInvoiceId
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
      recipientName: request.recipientName
    };

    const timer = TimerBuilder.delayed(jobData.delay, SchedulingTime.Day);
    const newJob = JobBuilder.basic(jobData.type, data);

    try {
      await this.scheduler.schedule(newJob, jobData.queName, timer);
      return right(null);
    } catch (e) {
      return left(new Errors.RescheduleTaskFailed(e));
    }
  }
}
