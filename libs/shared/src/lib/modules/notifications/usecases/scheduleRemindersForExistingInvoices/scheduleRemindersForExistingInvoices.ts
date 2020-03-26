import { SchedulingTime, TimerBuilder, JobBuilder } from '@hindawi/sisif';

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

import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { PayloadBuilder } from '../../../../infrastructure/message-queues/payloadBuilder';
import { SchedulerContract } from '../../../../infrastructure/scheduler/Scheduler';

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { AreNotificationsPausedUsecase } from '../areNotificationsPaused';
import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';

import { ResumeInvoiceConfirmationReminderUsecase } from '../resumeInvoiceConfirmationReminders';
import { PauseInvoiceConfirmationRemindersUsecase } from '../pauseInvoiceConfirmationReminders';
import { ResumeInvoicePaymentReminderUsecase } from '../resumeInvoicePaymentReminders';
import { AddEmptyPauseStateForInvoiceUsecase } from '../addEmptyPauseStateForInvoice';
import { PauseInvoicePaymentRemindersUsecase } from '../pauseInvoicePaymentReminders';

import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationType } from '../../domain/Notification';

// * Usecase specific
import { ScheduleRemindersForExistingInvoicesResponse as Response } from './scheduleRemindersForExistingInvoicesResponse';
import { ScheduleRemindersForExistingInvoicesErrors as Errors } from './scheduleRemindersForExistingInvoicesErrors';
import { ScheduleRemindersForExistingInvoicesDTO as DTO } from './scheduleRemindersForExistingInvoicesDTO';

interface InvoiceIdsDTO extends DTO {
  invoiceIds: string[];
}

type Context = AuthorizationContext<Roles>;
export type ScheduleRemindersForExistingInvoicesContext = Context;

export class ScheduleRemindersForExistingInvoicesUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private pausedReminderRepo: PausedReminderRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private loggerService: LoggerContract,
    private scheduler: SchedulerContract
  ) {
    this.resumeConfirmationReminders = this.resumeConfirmationReminders.bind(
      this
    );
    this.pauseConfirmationReminders = this.pauseConfirmationReminders.bind(
      this
    );
    this.getUnscheduledInvoices = this.getUnscheduledInvoices.bind(this);
    this.resumePaymentReminders = this.resumePaymentReminders.bind(this);
    this.pausePaymentReminders = this.pausePaymentReminders.bind(this);
    this.addPauseSettings = this.addPauseSettings.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.getUnscheduledInvoices)
        .then(this.addPauseSettings(context))
        .then(this.pauseConfirmationReminders(context))
        .then(this.resumeConfirmationReminders(context))
        .then(this.resumePaymentReminders(context))
        .map(() => Result.ok<void>(null));

      return execution.execute();
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }

  private async validateRequest(
    request: DTO
  ): Promise<
    Either<
      | Errors.ConfirmationQueueNameRequiredError
      | Errors.ConfirmationJobTypeRequiredError
      | Errors.ConfirmationDelayRequiredError
      | Errors.PaymentQueueNameRequiredError
      | Errors.CreditControlDelayIsRequired
      | Errors.PaymentJobTypeRequiredError
      | Errors.PaymentDelayRequiredError,
      DTO
    >
  > {
    if (!request.confirmationDelay) {
      return left(new Errors.ConfirmationDelayRequiredError());
    }
    if (!request.confirmationJobType) {
      return left(new Errors.ConfirmationJobTypeRequiredError());
    }
    if (!request.confirmationQueueName) {
      return left(new Errors.ConfirmationQueueNameRequiredError());
    }
    if (!request.creditControlDelay) {
      return left(new Errors.CreditControlDelayIsRequired());
    }
    if (!request.paymentDelay) {
      return left(new Errors.PaymentDelayRequiredError());
    }
    if (!request.paymentJobType) {
      return left(new Errors.PaymentJobTypeRequiredError());
    }
    if (!request.paymentQueueName) {
      return left(new Errors.PaymentQueueNameRequiredError());
    }

    return right(request);
  }

  private async getUnscheduledInvoices(
    request: DTO
  ): Promise<
    Either<Errors.GetInvoiceIdsWithoutPauseSettingsDbError, InvoiceIdsDTO>
  > {
    this.loggerService.info(
      `Determining the invoice ids which do not have pause settings, for rescheduling`
    );

    try {
      const result = await this.pausedReminderRepo.invoiceIdsWithNoPauseSettings();
      const response = {
        ...request,
        invoiceIds: result.map(id => id.id.toString())
      };
      return right(response);
    } catch (e) {
      return left(new Errors.GetInvoiceIdsWithoutPauseSettingsDbError(e));
    }
  }

  private addPauseSettings(context: Context) {
    return async (request: InvoiceIdsDTO) => {
      this.loggerService.info(
        `Adding the default pause settings for selected invoices`
      );

      const { invoiceIds } = request;
      const usecase = new AddEmptyPauseStateForInvoiceUsecase(
        this.pausedReminderRepo,
        this.invoiceRepo,
        this.loggerService
      );
      const results = invoiceIds.map(invoiceId =>
        usecase.execute({ invoiceId }, context)
      );
      const aggregated = await AsyncEither.asyncAll(results);

      return aggregated.map(() => request);
    };
  }

  private pauseConfirmationReminders(context: Context) {
    return async (request: InvoiceIdsDTO) => {
      this.loggerService.info(
        `Pausing the confirmation reminders for the selected invoice ids`
      );

      const { invoiceIds } = request;
      const usecase = new PauseInvoiceConfirmationRemindersUsecase(
        this.pausedReminderRepo,
        this.invoiceRepo,
        this.loggerService
      );
      const results = invoiceIds.map(invoiceId =>
        usecase.execute({ invoiceId }, context)
      );
      const aggregated = await AsyncEither.asyncAll(results);

      return aggregated.map(() => request);
    };
  }

  private resumeConfirmationReminders(context: Context) {
    return async (request: InvoiceIdsDTO) => {
      this.loggerService.info(
        `Resume the confirmation reminders for the selected invoice ids`
      );

      const {
        confirmationQueueName: queueName,
        confirmationDelay: reminderDelay,
        confirmationJobType: jobType,
        invoiceIds
      } = request;
      const usecase = new ResumeInvoiceConfirmationReminderUsecase(
        this.pausedReminderRepo,
        this.invoiceItemRepo,
        this.manuscriptRepo,
        this.invoiceRepo,
        this.loggerService,
        this.scheduler
      );
      const results = invoiceIds.map(invoiceId =>
        usecase.execute(
          { invoiceId, reminderDelay, queueName, jobType },
          context
        )
      );
      const aggregated = await AsyncEither.asyncAll(results);

      return aggregated.map(() => request);
    };
  }

  private pausePaymentReminders(context: Context) {
    return async (request: InvoiceIdsDTO) => {
      this.loggerService.info(
        `Pausing the payment reminders for the selected invoice ids`
      );

      const { invoiceIds } = request;
      const usecase = new PauseInvoicePaymentRemindersUsecase(
        this.pausedReminderRepo,
        this.invoiceRepo,
        this.loggerService
      );
      const results = invoiceIds.map(invoiceId =>
        usecase.execute({ invoiceId }, context)
      );
      const aggregated = await AsyncEither.asyncAll(results);

      return aggregated.map(() => request);
    };
  }

  private resumePaymentReminders(context: Context) {
    return async (request: InvoiceIdsDTO) => {
      this.loggerService.info(
        `Resuming the payment reminders for the selected invoice ids`
      );

      const {
        invoiceIds,
        paymentDelay: reminderDelay,
        paymentJobType: jobType,
        paymentQueueName: queueName
      } = request;
      const usecase = new ResumeInvoicePaymentReminderUsecase(
        this.pausedReminderRepo,
        this.invoiceItemRepo,
        this.manuscriptRepo,
        this.invoiceRepo,
        this.loggerService,
        this.scheduler
      );
      const results = invoiceIds.map(invoiceId =>
        usecase.execute({ invoiceId, jobType, queueName, reminderDelay })
      );
      const aggregated = await AsyncEither.asyncAll(results);

      return aggregated.map(() => request);
    };
  }
}
