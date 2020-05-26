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

import {
  Transaction,
  TransactionStatus,
} from '../../../transactions/domain/Transaction';
import { Invoice, InvoiceStatus } from '../../../invoices/domain/Invoice';
import { Payer } from '../../../payers/domain/Payer';

import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetPayerDetailsByInvoiceIdUsecase } from '../../../payers/usecases/getPayerDetailsByInvoiceId';
import { GetTransactionUsecase } from '../../../transactions/usecases/getTransaction/getTransaction';
import { ResumeInvoiceConfirmationReminderUsecase } from '../resumeInvoiceConfirmationReminders';
import { PauseInvoiceConfirmationRemindersUsecase } from '../pauseInvoiceConfirmationReminders';
import { ResumeInvoicePaymentReminderUsecase } from '../resumeInvoicePaymentReminders';
import { AddEmptyPauseStateForInvoiceUsecase } from '../addEmptyPauseStateForInvoice';
import { PauseInvoicePaymentRemindersUsecase } from '../pauseInvoicePaymentReminders';

// * Usecase specific
import { ScheduleRemindersForExistingInvoicesResponse as Response } from './scheduleRemindersForExistingInvoicesResponse';
import { ScheduleRemindersForExistingInvoicesDTO as DTO } from './scheduleRemindersForExistingInvoicesDTO';
import * as Errors from './scheduleRemindersForExistingInvoicesErrors';

interface InvoiceIdDTO extends DTO {
  invoiceId: string;
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
    this.shouldScheduleCreditControl = this.shouldScheduleCreditControl.bind(
      this
    );
    this.scheduleCreditControl = this.scheduleCreditControl.bind(this);
    this.resumeConfirmation = this.resumeConfirmation.bind(this);
    this.attachTransaction = this.attachTransaction.bind(this);
    this.pauseConfirmation = this.pauseConfirmation.bind(this);
    this.addPauseSettings = this.addPauseSettings.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.attachInvoice = this.attachInvoice.bind(this);
    this.resumePayment = this.resumePayment.bind(this);
    this.pausePayment = this.pausePayment.bind(this);
    this.attachPayer = this.attachPayer.bind(this);
    this.scheduleJob = this.scheduleJob.bind(this);
    this.logError = this.logError.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const validation = await new AsyncEither(request)
        .then(this.validateRequest)
        .map(() => Result.ok<void>())
        .execute();

      if (validation.isLeft()) {
        return validation;
      }

      const ids = this.pausedReminderRepo.invoiceIdsWithNoPauseSettings();
      for await (const id of ids) {
        const execution = new AsyncEither({
          ...request,
          invoiceId: id.id.toString(),
        })
          .then(this.addPauseSettings(context))
          .then(this.pauseConfirmation(context))
          .then(this.resumeConfirmation(context))
          .then(this.pausePayment(context))
          .then(this.resumePayment(context))
          .then(this.scheduleCreditControl(context))
          .map(() => Result.ok<void>(null));
        const maybeResult = await execution.execute();

        if (maybeResult.isLeft()) {
          const e = maybeResult.value.errorValue();
          this.logError('adding job', id.id.toString(), e);
        }
      }

      return right(Result.ok<void>());
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

  private addPauseSettings(context: Context) {
    return async (request: InvoiceIdDTO) => {
      this.loggerService.info(
        `Adding the default pause settings for selected invoices`
      );

      const { invoiceId } = request;
      const usecase = new AddEmptyPauseStateForInvoiceUsecase(
        this.pausedReminderRepo,
        this.invoiceRepo,
        this.loggerService
      );
      const result = await usecase.execute({ invoiceId }, context);

      return result.map(() => request);
    };
  }

  private pauseConfirmation(context: Context) {
    return async (request: InvoiceIdDTO) => {
      this.loggerService.info(
        `Pausing the confirmation reminders for the selected invoice ids`
      );

      const { invoiceId } = request;
      const usecase = new PauseInvoiceConfirmationRemindersUsecase(
        this.pausedReminderRepo,
        this.invoiceRepo,
        this.loggerService
      );
      try {
        const result = await usecase.execute({ invoiceId }, context);
        if (result.isLeft()) {
          const e = result.value.errorValue();
          this.logError('pausing confirmation', invoiceId, e);
        }
        return result.map(() => request);
      } catch (e) {
        this.logError('pausing confirmation', invoiceId, e);
        return left(new Errors.PausingConfirmationReminderError(invoiceId, e));
      }
    };
  }

  private resumeConfirmation(context: Context) {
    return async (request: InvoiceIdDTO) => {
      this.loggerService.info(
        `Resume the confirmation reminders for the selected invoice ids`
      );

      const {
        confirmationQueueName: queueName,
        confirmationDelay: reminderDelay,
        invoiceId,
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

      try {
        const result = await usecase.execute(
          { reminderDelay, invoiceId, queueName },
          context
        );
        if (result.isLeft()) {
          const e = result.value.errorValue();
          this.logError('resuming confirmation', invoiceId, e);
        }
        return result.map(() => request);
      } catch (e) {
        this.logError('resuming confirmation', invoiceId, e);
        return left(new Errors.ResumingConfirmationReminderError(invoiceId, e));
      }
    };
  }

  private pausePayment(context: Context) {
    return async (request: InvoiceIdDTO) => {
      this.loggerService.info(
        `Pausing the payment reminders for the selected invoice ids`
      );

      const { invoiceId } = request;
      const usecase = new PauseInvoicePaymentRemindersUsecase(
        this.pausedReminderRepo,
        this.invoiceRepo,
        this.loggerService
      );

      try {
        const result = await usecase.execute({ invoiceId }, context);
        if (result.isLeft()) {
          const e = result.value.getValue();
          this.logError('pausing payment', invoiceId, e);
        }
        return result.map(() => request);
      } catch (e) {
        this.logError('pausing payment', invoiceId, e);
        return left(new Errors.PausingPaymentReminderError(invoiceId, e));
      }
    };
  }

  private resumePayment(context: Context) {
    return async (request: InvoiceIdDTO) => {
      this.loggerService.info(
        `Resuming the payment reminders for the selected invoice ids`
      );

      const {
        paymentQueueName: queueName,
        paymentDelay: reminderDelay,
        invoiceId,
      } = request;
      const usecase = new ResumeInvoicePaymentReminderUsecase(
        this.pausedReminderRepo,
        this.transactionRepo,
        this.invoiceRepo,
        this.payerRepo,
        this.loggerService,
        this.scheduler
      );

      try {
        const result = await usecase.execute(
          { reminderDelay, invoiceId, queueName },
          context
        );
        if (result.isLeft()) {
          const e = result.value.errorValue();
          this.logError('resuming payment', invoiceId, e);
        }
        return result.map(() => request);
      } catch (e) {
        this.logError('resuming payment', invoiceId, e);
        return left(new Errors.ResumingPaymentReminderError(invoiceId, e));
      }
    };
  }

  private scheduleCreditControl(context: Context) {
    return async (request: InvoiceIdDTO) => {
      this.loggerService.info(`Scheduling the credit control reminder`);

      const { invoiceId } = request;

      try {
        const execution = new AsyncEither(request)
          .then(this.attachInvoice(context))
          .then(this.attachTransaction(context))
          .advanceOrEnd(this.shouldScheduleCreditControl)
          .then(this.attachPayer(context))
          .then(this.scheduleJob(SisifJobTypes.InvoiceCreditControlReminder));

        const result = await execution.execute();

        if (result.isLeft()) {
          const e = result.value.errorValue();
          this.logError('scheduling the credit control', invoiceId, e);
        }
        return result.map(() => request);
      } catch (e) {
        this.logError('scheduling the credit control', invoiceId, e);
        return left(
          new Errors.ResumingCreditControlReminderError(invoiceId, e)
        );
      }
    };
  }

  private async shouldScheduleCreditControl({
    creditControlDelay,
    transaction,
    invoice,
  }: InvoiceIdDTO & {
    transaction: Transaction;
    invoice: Invoice;
  }): Promise<Either<null, boolean>> {
    if (transaction.status !== TransactionStatus.ACTIVE) {
      return right(false);
    }

    if (invoice.status !== InvoiceStatus.ACTIVE) {
      return right(false);
    }

    const elapsedTime = new Date().getTime() - invoice.dateIssued.getTime();
    const originalDelay = creditControlDelay * SchedulingTime.Day;

    if (originalDelay <= elapsedTime) {
      return right(false);
    }

    return right(true);
  }

  private attachPayer(context: Context) {
    const usecase = new GetPayerDetailsByInvoiceIdUsecase(
      this.payerRepo,
      this.loggerService
    );
    return async (request: InvoiceIdDTO) => {
      const { invoiceId } = request;
      const maybePayer = await usecase.execute({ invoiceId }, context);

      return maybePayer.map((result) => ({
        ...request,
        payer: result.getValue(),
      }));
    };
  }

  private attachInvoice(context: Context) {
    const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    return async (request: InvoiceIdDTO) => {
      const { invoiceId } = request;
      const maybeInvoice = await usecase.execute({ invoiceId }, context);

      return maybeInvoice.map((result) => ({
        ...request,
        invoice: result.getValue(),
      }));
    };
  }

  private attachTransaction(context: Context) {
    return async (request: InvoiceIdDTO & { invoice: Invoice }) => {
      this.loggerService.info(
        `Get transaction details for invoice with id ${request.invoiceId}`
      );

      const usecase = new GetTransactionUsecase(this.transactionRepo);
      const transactionId = request.invoice?.transactionId?.id?.toString();
      try {
        const result = await usecase.execute({ transactionId }, context);

        if (result.isFailure) {
          return left<
            Errors.CouldNotGetTransactionForInvoiceError,
            InvoiceIdDTO & { invoice: Invoice; transaction: Transaction }
          >(
            new Errors.CouldNotGetTransactionForInvoiceError(
              request.invoiceId,
              new Error(result.errorValue() as any)
            )
          );
        }

        return right<
          Errors.CouldNotGetTransactionForInvoiceError,
          InvoiceIdDTO & { invoice: Invoice; transaction: Transaction }
        >({
          ...request,
          transaction: result.getValue(),
        });
      } catch (e) {
        return left<
          Errors.CouldNotGetTransactionForInvoiceError,
          InvoiceIdDTO & { invoice: Invoice; transaction: Transaction }
        >(
          new Errors.CouldNotGetTransactionForInvoiceError(request.invoiceId, e)
        );
      }
    };
  }

  private scheduleJob(jobType: string) {
    return async (
      request: InvoiceIdDTO & { invoice: Invoice; payer: Payer }
    ) => {
      const { creditControlDelay, paymentQueueName, invoice, payer } = request;
      const jobData = PayloadBuilder.invoiceReminder(
        invoice.id.toString(),
        payer.email.value,
        payer.name.value,
        ''
      );

      const elapsedTime = new Date().getTime() - invoice.dateIssued.getTime();
      const originalDelay = creditControlDelay * SchedulingTime.Day;
      const remainingDaysDelay =
        (originalDelay - elapsedTime) / SchedulingTime.Day;

      const job = JobBuilder.basic(jobType, jobData);
      const timer = TimerBuilder.delayed(
        remainingDaysDelay,
        SchedulingTime.Day
      );

      try {
        await this.scheduler.schedule(job, paymentQueueName, timer);
        return right<Errors.ScheduleCreditControlReminderError, null>(null);
      } catch (e) {
        return left<Errors.ScheduleCreditControlReminderError, null>(
          new Errors.ScheduleCreditControlReminderError(e)
        );
      }
    };
  }

  private logError(when: string, id: string, e: { message: string }) {
    this.loggerService.error(
      `While ${when} reminders for invoice {${id}} got error ${e.message}`,
      e
    );
  }
}
