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
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationType } from '../../domain/Notification';
import {
  TransactionStatus,
  Transaction,
} from '../../../transactions/domain/Transaction';

import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
import { GetTransactionUsecase } from '../../../transactions/usecases/getTransaction/getTransaction';
import { AreNotificationsPausedUsecase } from '../areNotificationsPaused';

// * Usecase specific
import { ResumeInvoiceConfirmationRemindersResponse as Response } from './resumeInvoiceConfirmationRemindersResponse';
import { ResumeInvoiceConfirmationRemindersDTO as DTO } from './resumeInvoiceConfirmationRemindersDTO';
import * as Errors from './resumeInvoiceConfirmationRemindersErrors';

interface CompoundDTO extends DTO {
  transaction: Transaction;
  manuscript: Manuscript;
  invoice: Invoice;
}

export class ResumeInvoiceConfirmationReminderUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private pausedReminderRepo: PausedReminderRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private loggerService: LoggerContract,
    private scheduler: SchedulerContract
  ) {
    super();

    this.calculateRemainingDelay = this.calculateRemainingDelay.bind(this);
    this.shouldScheduleReminder = this.shouldScheduleReminder.bind(this);
    this.existsInvoiceWithId = this.existsInvoiceWithId.bind(this);
    this.validatePauseState = this.validatePauseState.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.getTransaction = this.getTransaction.bind(this);
    this.getManuscript = this.getManuscript.bind(this);
    this.scheduleJob = this.scheduleJob.bind(this);
    this.getInvoice = this.getInvoice.bind(this);
    this.resume = this.resume.bind(this);
  }

  @Authorize('reminder:toggle')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.validatePauseState(context))
        .then(this.getInvoice(context))
        .then(this.getManuscript(context))
        .then(this.getTransaction(context))
        .then(this.resume)
        .advanceOrEnd(this.shouldScheduleReminder)
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
        `Validate the state of the reminders of type ${NotificationType.REMINDER_CONFIRMATION} for invoice with id ${request.invoiceId}`
      );

      const usecase = new AreNotificationsPausedUsecase(
        this.pausedReminderRepo,
        this.loggerService
      );
      const { invoiceId } = request;
      const maybeResult = await usecase.execute(
        { invoiceId, notificationType: NotificationType.REMINDER_CONFIRMATION },
        context
      );

      return maybeResult.chain((isPaused) => {
        if (!isPaused) {
          return left<Errors.ConfirmationRemindersNotPausedError, DTO>(
            new Errors.ConfirmationRemindersNotPausedError(invoiceId)
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

  private getManuscript(context: Context) {
    return async (request: CompoundDTO) => {
      this.loggerService.info(
        `Get details of manuscript associated with invoice with id ${request.invoiceId}`
      );

      const usecase = new GetManuscriptByInvoiceIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );
      const { invoiceId } = request;
      const maybeResult = await usecase.execute({ invoiceId }, context);

      return maybeResult.map((result) => ({
        ...request,
        manuscript: result[0],
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

  private async shouldScheduleReminder(request: CompoundDTO) {
    this.loggerService.info(
      `Determine if the reminders of type ${NotificationType.REMINDER_CONFIRMATION} should be resumed for invoice with id ${request.invoiceId}`
    );

    if (request.transaction.status !== TransactionStatus.ACTIVE) {
      return right<null, boolean>(false);
    }
    if (request.invoice.status !== InvoiceStatus.DRAFT) {
      return right<null, boolean>(false);
    }

    return right<null, boolean>(true);
  }

  private async resume(
    request: CompoundDTO
  ): Promise<Either<Errors.ReminderResumeSaveDbError, CompoundDTO>> {
    this.loggerService.info(
      `Save the un-paused state of reminders of type ${NotificationType.REMINDER_CONFIRMATION} from invoice with id ${request.invoiceId}`
    );

    try {
      await this.pausedReminderRepo.setReminderPauseState(
        request.invoice.invoiceId,
        false,
        NotificationType.REMINDER_CONFIRMATION
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
      `Schedule the next job for sending reminders of type ${NotificationType.REMINDER_CONFIRMATION} for invoice with id ${request.invoiceId}`
    );

    const { reminderDelay, manuscript, queueName, invoice } = request;
    const { authorFirstName, authorSurname, authorEmail } = manuscript;
    const data = PayloadBuilder.invoiceReminder(
      invoice.id.toString(),
      authorEmail,
      authorFirstName,
      authorSurname
    );
    const remainingDelay = this.calculateRemainingDelay(
      invoice.dateAccepted,
      reminderDelay
    );
    const timer = TimerBuilder.delayed(remainingDelay, SchedulingTime.Day);
    const newJob = JobBuilder.basic(SisifJobTypes.InvoiceConfirmReminder, data);

    try {
      await this.scheduler.schedule(newJob, queueName, timer);
      return right(null);
    } catch (e) {
      await this.pausedReminderRepo.setReminderPauseState(
        request.invoice.invoiceId,
        true,
        NotificationType.REMINDER_CONFIRMATION
      );
      return left(new Errors.ScheduleTaskFailed(e));
    }
  }

  private calculateRemainingDelay(
    dateAccepted: Date,
    standardDelay: number
  ): number {
    this.loggerService.info(
      `Calculate the remaining delay until next reminder`
    );

    const elapsedTime = new Date().getTime() - dateAccepted.getTime();
    const period = standardDelay * SchedulingTime.Day;
    const passedPeriods = Math.trunc(elapsedTime / period);
    const nextTime = period * (passedPeriods + 1);

    return (nextTime - elapsedTime) / SchedulingTime.Day;
  }
}
