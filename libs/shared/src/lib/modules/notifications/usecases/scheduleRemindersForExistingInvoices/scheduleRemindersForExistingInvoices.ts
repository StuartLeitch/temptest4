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
  Authorize,
} from '../../../../domain/authorization/decorators/Authorize';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { PayloadBuilder } from '../../../../infrastructure/message-queues/payloadBuilder';
import { SchedulerContract } from '../../../../infrastructure/scheduler/Scheduler';
import {
  SisifJobTypes,
  JobBuilder,
} from '../../../../infrastructure/message-queues/contracts/Job';
import {
  SchedulingTime,
  TimerBuilder,
} from '../../../../infrastructure/message-queues/contracts/Time';

import { Invoice } from '../../../invoices/domain/Invoice';
import { Payer } from '../../../payers/domain/Payer';

import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetPayerDetailsByInvoiceIdUsecase } from '../../../payers/usecases/getPayerDetailsByInvoiceId';
import { ResumeInvoiceConfirmationReminderUsecase } from '../resumeInvoiceConfirmationReminders';
import { PauseInvoiceConfirmationRemindersUsecase } from '../pauseInvoiceConfirmationReminders';
import { ResumeInvoicePaymentReminderUsecase } from '../resumeInvoicePaymentReminders';
import { AddEmptyPauseStateForInvoiceUsecase } from '../addEmptyPauseStateForInvoice';
import { PauseInvoicePaymentRemindersUsecase } from '../pauseInvoicePaymentReminders';

// * Usecase specific
import { ScheduleRemindersForExistingInvoicesResponse as Response } from './scheduleRemindersForExistingInvoicesResponse';
import { ScheduleRemindersForExistingInvoicesDTO as DTO } from './scheduleRemindersForExistingInvoicesDTO';
import * as Errors from './scheduleRemindersForExistingInvoicesErrors';

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
    private payerRepo: PayerRepoContract,
    private loggerService: LoggerContract,
    private scheduler: SchedulerContract
  ) {
    this.scheduleOneCreditControl = this.scheduleOneCreditControl.bind(this);
    this.scheduleAllCreditControl = this.scheduleAllCreditControl.bind(this);
    this.getUnscheduledInvoices = this.getUnscheduledInvoices.bind(this);
    this.getInvoiceFromUsecase = this.getInvoiceFromUsecase.bind(this);
    this.getPayerFromUsecase = this.getPayerFromUsecase.bind(this);
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
        .then(this.pausePayment(context))
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
        invoiceIds: result.map((id) => id.id.toString()),
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
      const results = invoiceIds.map((invoiceId) =>
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
      const results = invoiceIds.map(async (invoiceId) => {
        try {
          const result = await usecase.execute({ invoiceId }, context);
          if (result.isLeft()) {
            const e = result.value.errorValue();
            this.loggerService.error(
              `When pausing confirmation reminders for invoice {${invoiceId}} got error ${e.message}`,
              e
            );
          }
          return result;
        } catch (e) {
          this.loggerService.error(
            `When pausing confirmation reminders for invoice {${invoiceId}} got error ${e.message}`,
            e
          );
          return left(Result.fail(e));
        }
      });
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
        invoiceIds,
      } = request;
      const usecase = new ResumeInvoiceConfirmationReminderUsecase(
        this.pausedReminderRepo,
        this.invoiceItemRepo,
        this.transactionRepo,
        this.manuscriptRepo,
        this.invoiceRepo,
        this.loggerService,
        this.scheduler
      );
      const results = invoiceIds.map(async (invoiceId) => {
        try {
          const result = await usecase.execute(
            { reminderDelay, invoiceId, queueName },
            context
          );
          if (result.isLeft()) {
            const e = result.value.errorValue();
            this.loggerService.error(
              `When resuming confirmation reminders for invoice {${invoiceId}} got error ${e.message}`,
              e
            );
          }
          return result;
        } catch (e) {
          this.loggerService.error(
            `When resuming confirmation reminders for invoice {${invoiceId}} got error ${e.message}`,
            e
          );
          return left(Result.fail(e));
        }
      });
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
      const results = invoiceIds.map(async (invoiceId) => {
        try {
          const result = await usecase.execute({ invoiceId }, context);
          if (result.isLeft()) {
            const e = result.value.getValue();
            this.loggerService.error(
              `While pausing payment reminders for invoice {${invoiceId}} got error ${e.message}`,
              e
            );
          }
          return result;
        } catch (e) {
          this.loggerService.error(
            `While pausing payment reminders for invoice {${invoiceId}} got error ${e.message}`,
            e
          );
          return left(Result.fail(e));
        }
      });
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
        paymentQueueName: queueName,
        paymentDelay: reminderDelay,
      } = request;
      const usecase = new ResumeInvoicePaymentReminderUsecase(
        this.pausedReminderRepo,
        this.invoiceRepo,
        this.payerRepo,
        this.loggerService,
        this.scheduler
      );
      const results = invoiceIds.map(async (invoiceId) => {
        try {
          const result = await usecase.execute(
            { reminderDelay, invoiceId, queueName },
            context
          );
          if (result.isLeft()) {
            const e = result.value.errorValue();
            this.loggerService.error(
              `While resuming payment reminders for invoice {${invoiceId}} got error ${e.message}`,
              e
            );
          }
          return result;
        } catch (e) {
          this.loggerService.error(
            `While resuming payment reminders for invoice {${invoiceId}} got error ${e.message}`,
            e
          );
          return left(Result.fail(e));
        }
      });
      const aggregated = await AsyncEither.asyncAll(results);

      return aggregated.map(() => request);
    };
  }

  private scheduleAllCreditControl(context: Context) {
    return async (request: InvoiceIdsDTO) => {
      this.loggerService.info(`Scheduling the credit control reminder`);

      const { invoiceIds, creditControlDelay, paymentQueueName } = request;
      const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
      const payerUsecase = new GetPayerDetailsByInvoiceIdUsecase(
        this.payerRepo,
        this.loggerService
      );
      const scheduleForInvoice = this.scheduleOneCreditControl(
        invoiceUsecase,
        payerUsecase,
        paymentQueueName,
        creditControlDelay,
        context
      );

      const results = invoiceIds.map(async (invoiceId) => {
        try {
          const result = await scheduleForInvoice(invoiceId);
          if (result.isLeft()) {
            const e = result.value.errorValue();
            this.loggerService.error(
              `While scheduling the credit control reminder for invoice {${invoiceId}} got error ${e.message}`,
              e
            );
          }
          return result;
        } catch (e) {
          this.loggerService.error(
            `While scheduling the credit control reminder for invoice {${invoiceId}} got error ${e.message}`,
            e
          );
          return left(Result.fail(e));
        }
      });
      const aggregated = await AsyncEither.asyncAll(results);

      return aggregated.map(() => request);
    };
  }

  private getPayerFromUsecase(
    usecase: GetPayerDetailsByInvoiceIdUsecase,
    context: Context
  ) {
    interface Data {
      invoiceId: string;
      invoice: Invoice;
    }
    return async (request: Data) => {
      const { invoiceId } = request;
      const maybePayer = await usecase.execute({ invoiceId }, context);

      return maybePayer.map((result) => ({
        ...request,
        payer: result.getValue(),
      }));
    };
  }

  private getInvoiceFromUsecase(
    usecase: GetInvoiceDetailsUsecase,
    context: Context
  ) {
    return async (invoiceId: string) => {
      const maybeInvoice = await usecase.execute({ invoiceId }, context);

      return maybeInvoice.map((result) => ({
        invoiceId,
        invoice: result.getValue(),
      }));
    };
  }

  private scheduleOneCreditControl(
    getInvoiceUsecase: GetInvoiceDetailsUsecase,
    getPayerUsecase: GetPayerDetailsByInvoiceIdUsecase,
    queueName: string,
    delay: number,
    context: Context
  ) {
    return (invoiceId: string) => {
      const execution = new AsyncEither(invoiceId)
        .then(this.getInvoiceFromUsecase(getInvoiceUsecase, context))
        .then(this.getPayerFromUsecase(getPayerUsecase, context))
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
    return async ({ invoice, payer }: { invoice: Invoice; payer: Payer }) => {
      const jobData = PayloadBuilder.invoiceReminder(
        invoice.id.toString(),
        payer.email.value,
        payer.name.value,
        ''
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