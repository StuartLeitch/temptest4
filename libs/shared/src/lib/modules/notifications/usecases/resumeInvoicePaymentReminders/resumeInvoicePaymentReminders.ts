// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
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

import { PayloadBuilder } from '../../../../infrastructure/message-queues/payloadBuilder';
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

import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationType } from '../../domain/Notification';
import { Payer } from '../../../payers/domain/Payer';
import {
  TransactionStatus,
  Transaction,
} from '../../../transactions/domain/Transaction';

import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetPayerDetailsByInvoiceIdUsecase } from '../../../payers/usecases/getPayerDetailsByInvoiceId';
import { GetTransactionUsecase } from '../../../transactions/usecases/getTransaction/getTransaction';
import { AreNotificationsPausedUsecase } from '../areNotificationsPaused';

// * Usecase specific
import { ResumeInvoicePaymentRemindersResponse as Response } from './resumeInvoicePaymentRemindersResponse';
import { ResumeInvoicePaymentRemindersDTO as DTO } from './resumeInvoicePaymentRemindersDTO';
import * as Errors from './resumeInvoicePaymentRemindersErrors';

interface CompoundDTO extends DTO {
  transaction: Transaction;
  invoice: Invoice;
  payer: Payer;
}

export class ResumeInvoicePaymentReminderUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private pausedReminderRepo: PausedReminderRepoContract,
    private transactionRepo: TransactionRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private payerRepo: PayerRepoContract,
    private loggerService: LoggerContract,
    private scheduler: SchedulerContract
  ) {
    super();

    this.calculateRemainingDelay = this.calculateRemainingDelay.bind(this);
    this.existsInvoiceWithId = this.existsInvoiceWithId.bind(this);
    this.validatePauseState = this.validatePauseState.bind(this);
    this.shouldScheduleJob = this.shouldScheduleJob.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.getTransaction = this.getTransaction.bind(this);
    this.scheduleJob = this.scheduleJob.bind(this);
    this.getInvoice = this.getInvoice.bind(this);
    this.getPayer = this.getPayer.bind(this);
    this.resume = this.resume.bind(this);
  }

  @Authorize('reminder:toggle')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.validatePauseState(context))
        .then(this.getInvoice(context))
        .then(this.getTransaction(context))
        .then(this.resume)
        .advanceOrEnd(this.shouldScheduleJob)
        .then(this.getPayer(context))
        .then(this.scheduleJob)
        .map(() => null);

      return execution.execute();
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }

  private async validateRequest(
    request: DTO
  ): Promise<
    Either<
      | Errors.ReminderDelayRequiredError
      | Errors.InvoiceIdRequiredError
      | Errors.QueueNameRequiredError
      | Errors.InvoiceNotFoundError,
      DTO
    >
  > {
    this.loggerService.info(`Validate usecase request data`);

    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    const invoiceExists = await this.existsInvoiceWithId(request.invoiceId);
    if (!invoiceExists) {
      return left(new Errors.InvoiceNotFoundError(request.invoiceId));
    }

    if (!request.queueName) {
      return left(new Errors.QueueNameRequiredError());
    }

    if (!request.reminderDelay) {
      return left(new Errors.ReminderDelayRequiredError());
    }

    return right(request);
  }

  private async existsInvoiceWithId(id: string) {
    this.loggerService.info(`Check if invoice with id ${id} exists in the DB`);

    const uuid = new UniqueEntityID(id);
    const invoiceId = InvoiceId.create(uuid);

    return await this.invoiceRepo.existsWithId(invoiceId);
  }

  private validatePauseState(context: Context) {
    return async (request: DTO) => {
      this.loggerService.info(
        `Validate the state of the reminders of type ${NotificationType.REMINDER_PAYMENT} for invoice with id ${request.invoiceId}`
      );

      const usecase = new AreNotificationsPausedUsecase(
        this.pausedReminderRepo,
        this.loggerService
      );
      const { invoiceId } = request;
      const maybeResult = await usecase.execute(
        { invoiceId, notificationType: NotificationType.REMINDER_PAYMENT },
        context
      );

      return maybeResult
        .map((result) => result)
        .chain((isPaused) => {
          if (!isPaused) {
            return left<Errors.PaymentRemindersNotPausedError, DTO>(
              new Errors.PaymentRemindersNotPausedError(invoiceId)
            );
          } else {
            return right<null, DTO>(request);
          }
        });
    };
  }

  private getInvoice(context: Context) {
    return async (request: CompoundDTO) => {
      this.loggerService.info(
        `Get details of invoice with id ${request.invoiceId}`
      );

      const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
      const { invoiceId } = request;
      const maybeResult = await usecase.execute({ invoiceId }, context);

      return maybeResult.map((invoice) => ({
        ...request,
        invoice,
      }));
    };
  }

  private getTransaction(context: Context) {
    return async (request: CompoundDTO) => {
      this.loggerService.info(
        `Get transaction details for invoice with id ${request.invoiceId}`
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
              request.invoiceId,
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
          new Errors.CouldNotGetTransactionForInvoiceError(request.invoiceId, e)
        );
      }
    };
  }

  private getPayer(context: Context) {
    return async (request: CompoundDTO) => {
      const usecase = new GetPayerDetailsByInvoiceIdUsecase(
        this.payerRepo,
        this.loggerService
      );

      const { invoiceId } = request;
      const maybeResult = await usecase.execute(
        {
          invoiceId,
        },
        context
      );

      return maybeResult.map((payer) => ({
        ...request,
        payer,
      }));
    };
  }

  private async resume(
    request: CompoundDTO
  ): Promise<Either<Errors.ReminderResumeSaveDbError, CompoundDTO>> {
    this.loggerService.info(
      `Save the un-paused state of reminders of type ${NotificationType.REMINDER_PAYMENT} from invoice with id ${request.invoiceId}`
    );

    try {
      await this.pausedReminderRepo.setReminderPauseState(
        request.invoice.invoiceId,
        false,
        NotificationType.REMINDER_PAYMENT
      );
      return right(request);
    } catch (e) {
      return left(new Errors.ReminderResumeSaveDbError(e));
    }
  }

  private async scheduleJob(
    request: CompoundDTO
  ): Promise<Either<Errors.ScheduleTaskFailed, void>> {
    this.loggerService.info(
      `Schedule the next job for sending reminders of type ${NotificationType.REMINDER_PAYMENT} for invoice with id ${request.invoiceId}`
    );

    const { reminderDelay, queueName, invoice, payer } = request;
    const { email, name } = payer;
    const data = PayloadBuilder.invoiceReminder(
      invoice.id.toString(),
      email.value,
      name.value,
      ''
    );
    const remainingDelay = this.calculateRemainingDelay(
      invoice.dateIssued,
      reminderDelay
    );
    const timer = TimerBuilder.delayed(remainingDelay, SchedulingTime.Day);
    const newJob = JobBuilder.basic(SisifJobTypes.InvoicePaymentReminder, data);

    try {
      await this.scheduler.schedule(newJob, queueName, timer);
      return right(null);
    } catch (e) {
      await this.pausedReminderRepo.setReminderPauseState(
        request.invoice.invoiceId,
        true,
        NotificationType.REMINDER_PAYMENT
      );
      return left(new Errors.ScheduleTaskFailed(e));
    }
  }

  private async shouldScheduleJob({
    reminderDelay,
    transaction,
    invoiceId,
    invoice,
  }: DTO & { invoice: Invoice; transaction: Transaction }) {
    this.loggerService.info(
      `Determine if the job for reminders of type ${NotificationType.REMINDER_PAYMENT} should be scheduled for invoice with id ${invoiceId}`
    );

    if (transaction.status !== TransactionStatus.ACTIVE) {
      return right<null, boolean>(false);
    }

    if (invoice.status !== InvoiceStatus.ACTIVE) {
      return right<null, boolean>(false);
    }

    const elapsedTime = new Date().getTime() - invoice.dateIssued.getTime();
    const period = reminderDelay * SchedulingTime.Day;
    const passedPeriods = Math.trunc(elapsedTime / period);

    if (passedPeriods >= 3) {
      return right<null, boolean>(false);
    }

    return right<null, boolean>(true);
  }

  private calculateRemainingDelay(
    dateIssued: Date,
    standardDelay: number
  ): number {
    this.loggerService.info(
      `Calculate the remaining delay until next reminder`
    );

    const elapsedTime = new Date().getTime() - dateIssued.getTime();
    const period = standardDelay * SchedulingTime.Day;
    const passedPeriods = Math.trunc(elapsedTime / period);
    const nextTime = period * (passedPeriods + 1);

    return (nextTime - elapsedTime) / SchedulingTime.Day;
  }
}
