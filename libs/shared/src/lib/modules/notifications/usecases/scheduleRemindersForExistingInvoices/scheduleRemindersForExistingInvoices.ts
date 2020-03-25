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

import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationType } from '../../domain/Notification';

// * Usecase specific
import { ScheduleRemindersForExistingInvoicesResponse as Response } from './scheduleRemindersForExistingInvoicesResponse';
import { ScheduleRemindersForExistingInvoicesErrors as Errors } from './scheduleRemindersForExistingInvoicesErrors';
import { ScheduleRemindersForExistingInvoicesDTO as DTO } from './scheduleRemindersForExistingInvoicesDTO';

interface CompoundDTO extends DTO {
  manuscript: Manuscript;
  invoice: Invoice;
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
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither(request);

      // return execution.execute();
      return null;
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }
}
