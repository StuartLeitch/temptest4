import {
  SchedulingTime,
  SisifJobTypes,
  TimerBuilder,
  JobBuilder
} from '@hindawi/sisif';

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

import { Manuscript } from '../../../manuscripts/domain/Manuscript';

import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
import { ResumeInvoiceConfirmationReminderUsecase } from '../resumeInvoiceConfirmationReminders';
import { PauseInvoiceConfirmationRemindersUsecase } from '../pauseInvoiceConfirmationReminders';
import { ResumeInvoicePaymentReminderUsecase } from '../resumeInvoicePaymentReminders';
import { AddEmptyPauseStateForInvoiceUsecase } from '../addEmptyPauseStateForInvoice';
import { PauseInvoicePaymentRemindersUsecase } from '../pauseInvoicePaymentReminders';

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
    private transactionRepo: TransactionRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private loggerService: LoggerContract,
    private scheduler: SchedulerContract
  ) {
    this.scheduleOneCreditControl = this.scheduleOneCreditControl.bind(this);
    this.scheduleAllCreditControl = this.scheduleAllCreditControl.bind(this);
    this.getUnscheduledInvoices = this.getUnscheduledInvoices.bind(this);
    this.resumeConfirmation = this.resumeConfirmation.bind(this);
    this.pauseConfirmation = this.pauseConfirmation.bind(this);
    this.addPauseSettings = this.addPauseSettings.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.resumePayment = this.resumePayment.bind(this);
    this.pausePayment = this.pausePayment.bind(this);
    this.scheduleJob = this.scheduleJob.bind(this);
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
        .then(this.pauseConfirmation(context))
        .then(this.resumeConfirmation(context))
        .then(this.resumePayment(context))
        .then(this.scheduleAllCreditControl(context))
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
      | Errors.ConfirmationDelayRequiredError
      | Errors.PaymentQueueNameRequiredError
      | Errors.CreditControlDelayIsRequired
      | Errors.PaymentDelayRequiredError,
      DTO
    >
  > {
    if (!request.confirmationDelay) {
      return left(new Errors.ConfirmationDelayRequiredError());
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

  private pauseConfirmation(context: Context) {
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

  private resumeConfirmation(context: Context) {
    return async (request: InvoiceIdsDTO) => {
      this.loggerService.info(
        `Resume the confirmation reminders for the selected invoice ids`
      );

      const {
        confirmationQueueName: queueName,
        confirmationDelay: reminderDelay,
        invoiceIds
      } = request;
      const jobType = SisifJobTypes.InvoiceConfirmReminder;
      const usecase = new ResumeInvoiceConfirmationReminderUsecase(
        this.pausedReminderRepo,
        this.invoiceItemRepo,
        this.transactionRepo,
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

  private pausePayment(context: Context) {
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

  private resumePayment(context: Context) {
    return async (request: InvoiceIdsDTO) => {
      this.loggerService.info(
        `Resuming the payment reminders for the selected invoice ids`
      );

      const {
        invoiceIds,
        paymentDelay: reminderDelay,
        paymentQueueName: queueName
      } = request;
      const jobType = SisifJobTypes.InvoicePaymentReminder;
      const usecase = new ResumeInvoicePaymentReminderUsecase(
        this.pausedReminderRepo,
        this.invoiceItemRepo,
        this.manuscriptRepo,
        this.invoiceRepo,
        this.loggerService,
        this.scheduler
      );
      const results = invoiceIds.map(invoiceId =>
        usecase.execute(
          { invoiceId, jobType, queueName, reminderDelay },
          context
        )
      );
      const aggregated = await AsyncEither.asyncAll(results);

      return aggregated.map(() => request);
    };
  }

  private scheduleAllCreditControl(context: Context) {
    return async (request: InvoiceIdsDTO) => {
      this.loggerService.info(`Scheduling the credit control reminder`);

      const { invoiceIds, creditControlDelay, paymentQueueName } = request;
      const usecase = new GetManuscriptByInvoiceIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );
      const scheduleForInvoice = this.scheduleOneCreditControl(
        usecase,
        paymentQueueName,
        creditControlDelay,
        context
      );
      const results = invoiceIds.map(scheduleForInvoice);
      const aggregated = await AsyncEither.asyncAll(results);

      return aggregated.map(() => request);
    };
  }

  private scheduleOneCreditControl(
    getManuscriptUsecase: GetManuscriptByInvoiceIdUsecase,
    queueName: string,
    delay: number,
    context: Context
  ) {
    return (invoiceId: string) => {
      const execution = new AsyncEither(invoiceId)
        .then(invoiceId => getManuscriptUsecase.execute({ invoiceId }, context))
        .map(result => result.getValue()[0])
        .then(
          this.scheduleJob(
            SisifJobTypes.InvoiceCreditControlReminder,
            queueName,
            delay
          )
        );
      return execution.execute();
    };
  }

  private scheduleJob(jobType: string, queueName: string, delay: number) {
    return async ({
      authorFirstName,
      authorSurname,
      authorEmail,
      customId
    }: Manuscript) => {
      const jobData = PayloadBuilder.invoiceReminder(
        customId,
        authorEmail,
        authorFirstName,
        authorSurname
      );
      const job = JobBuilder.basic(jobType, jobData);
      const timer = TimerBuilder.delayed(delay, SchedulingTime.Day);

      try {
        await this.scheduler.schedule(job, queueName, timer);
        return right<Errors.ScheduleCreditControlReminderError, null>(null);
      } catch (e) {
        return left<Errors.ScheduleCreditControlReminderError, null>(
          new Errors.ScheduleCreditControlReminderError(e)
        );
      }
    };
  }
}
