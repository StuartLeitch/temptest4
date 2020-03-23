import { differenceInCalendarDays } from 'date-fns';

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

import { PayloadBuilder } from '../../../../infrastructure/message-queues/payloadBuilder';
import { SchedulerContract } from '../../../../infrastructure/scheduler/Scheduler';
import { EmailService } from '../../../../infrastructure/communication-channels';

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { AreNotificationsPausedUsecase } from '../areNotificationsPaused';
import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';

import { NotificationType, Notification } from '../../domain/Notification';
import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';

// * Usecase specific
import { ResumeInvoiceConfirmationRemindersResponse as Response } from './resumeInvoiceConfirmationRemindersResponse';
import { ResumeInvoiceConfirmationRemindersErrors as Errors } from './resumeInvoiceConfirmationRemindersErrors';
import { ResumeInvoiceConfirmationRemindersDTO as DTO } from './resumeInvoiceConfirmationRemindersDTO';

interface CompoundDTO extends DTO {
  manuscript: Manuscript;
  invoice: Invoice;
}

type Context = AuthorizationContext<Roles>;
export type ResumeInvoiceConfirmationReminderContext = Context;

export class ResumeInvoiceConfirmationReminderUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private sentNotificationRepo: SentNotificationRepoContract,
    private pausedReminderRepo: PausedReminderRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private scheduler: SchedulerContract,
    private emailService: EmailService
  ) {
    this.existsInvoiceWithId = this.existsInvoiceWithId.bind(this);
    this.validatePauseState = this.validatePauseState.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.getManuscript = this.getManuscript.bind(this);
    this.scheduleJob = this.scheduleJob.bind(this);
    this.getInvoice = this.getInvoice.bind(this);
    this.resume = this.resume.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.validatePauseState(context))
        .then(this.getInvoice(context))
        .then(this.getManuscript(context))
        .advanceOrEnd(shouldResumeReminder);

      return null;
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }

  private async existsInvoiceWithId(id: string) {
    const uuid = new UniqueEntityID(id);
    const invoiceId = InvoiceId.create(uuid).getValue();
    return await this.invoiceRepo.existsWithId(invoiceId);
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

  private validatePauseState(context: Context) {
    return async (request: DTO) => {
      const usecase = new AreNotificationsPausedUsecase(
        this.pausedReminderRepo
      );
      const { invoiceId } = request;
      const maybeResult = await usecase.execute(
        { invoiceId, notificationType: NotificationType.REMINDER_CONFIRMATION },
        context
      );

      return maybeResult
        .map(result => result.getValue())
        .chain(isPaused => {
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
      const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
      const { invoiceId } = request;
      const maybeResult = await usecase.execute({ invoiceId }, context);

      return maybeResult.map(result => ({
        ...request,
        invoice: result.getValue()
      }));
    };
  }

  private getManuscript(context: Context) {
    return async (request: CompoundDTO) => {
      const usecase = new GetManuscriptByInvoiceIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );
      const { invoiceId } = request;
      const maybeResult = await usecase.execute({ invoiceId }, context);

      return maybeResult.map(result => ({
        ...request,
        manuscript: result.getValue()[0]
      }));
    };
  }

  private async resume(
    request: CompoundDTO
  ): Promise<Either<Errors.ReminderResumeSaveDbError, CompoundDTO>> {
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
    const { reminderDelay, manuscript, queueName, jobType, invoice } = request;
    const data = PayloadBuilder.authorReminder(manuscript);
    const remainingDelay = calculateRemainingDelay(
      invoice.dateAccepted,
      reminderDelay
    );
    const timer = TimerBuilder.delayed(remainingDelay, SchedulingTime.Day);
    const newJob = JobBuilder.basic(jobType, data);

    try {
      await this.scheduler.schedule(newJob, queueName, timer);
    } catch (e) {
      await this.pausedReminderRepo.setReminderPauseState(
        request.invoice.invoiceId,
        true,
        NotificationType.REMINDER_CONFIRMATION
      );
      return left(new Errors.ScheduleTaskFailed(e));
    }
  }
}

async function shouldResumeReminder(request: CompoundDTO) {
  if (request.invoice.status !== InvoiceStatus.DRAFT) {
    return right<null, boolean>(false);
  }

  return right<null, boolean>(true);
}

function calculateRemainingDelay(
  dateAccepted: Date,
  standardDelay: number
): number {
  const elapsedTime = new Date().getTime() - dateAccepted.getTime();
  const period = standardDelay * SchedulingTime.Day;
  const passedPeriods = Math.trunc(elapsedTime / period);
  const nextTime = period * (passedPeriods + 1);
  return (nextTime - elapsedTime) / SchedulingTime.Day;
}
