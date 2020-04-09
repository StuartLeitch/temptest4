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

import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationType } from '../../domain/Notification';

// * Usecase specific
import { PauseInvoicePaymentRemindersResponse as Response } from './pauseInvoicePaymentRemindersResponse';
import { PauseInvoicePaymentRemindersErrors as Errors } from './pauseInvoicePaymentRemindersErrors';
import { PauseInvoicePaymentRemindersDTO as DTO } from './pauseInvoicePaymentRemindersDTO';

type Context = AuthorizationContext<Roles>;
export type PauseInvoicePaymentRemindersContext = Context;

export class PauseInvoicePaymentRemindersUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private pausedReminderRepo: PausedReminderRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private loggerService: LoggerContract
  ) {
    this.existsInvoiceWithId = this.existsInvoiceWithId.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.pause = this.pause.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.pause)
        .map(() => Result.ok<void>(null));

      return execution.execute();
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }

  private async validateRequest(
    request: DTO
  ): Promise<
    Either<Errors.InvoiceIdRequiredError | Errors.InvoiceNotFoundError, DTO>
  > {
    this.loggerService.info(`Validate usecase request data`);

    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    if (!(await this.existsInvoiceWithId(request.invoiceId))) {
      return left(new Errors.InvoiceNotFoundError(request.invoiceId));
    }

    return right(request);
  }

  private async existsInvoiceWithId(id: string) {
    this.loggerService.info(`Check if invoice with id ${id} exists in the DB`);

    const uuid = new UniqueEntityID(id);
    const invoiceId = InvoiceId.create(uuid).getValue();

    return await this.invoiceRepo.existsWithId(invoiceId);
  }

  private async pause(
    request: DTO
  ): Promise<Either<Errors.SetReminderPauseDbError, null>> {
    this.loggerService.info(
      `Pause reminders of type ${NotificationType.REMINDER_PAYMENT} for invoice with id ${request.invoiceId}`
    );

    const uuid = new UniqueEntityID(request.invoiceId);
    const invoiceId = InvoiceId.create(uuid).getValue();

    try {
      await this.pausedReminderRepo.setReminderPauseState(
        invoiceId,
        true,
        NotificationType.REMINDER_PAYMENT
      );
      return right(null);
    } catch (e) {
      return left(new Errors.SetReminderPauseDbError(e));
    }
  }
}
