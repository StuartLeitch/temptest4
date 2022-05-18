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

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationType } from '../../domain/Notification';

import { LoggerContract } from '../../../../infrastructure/logging';

import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

// * Usecase specific
import { PauseInvoicePaymentRemindersResponse as Response } from './pauseInvoicePaymentRemindersResponse';
import type { PauseInvoicePaymentRemindersDTO as DTO } from './pauseInvoicePaymentRemindersDTO';
import * as Errors from './pauseInvoicePaymentRemindersErrors';

export class PauseInvoicePaymentRemindersUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(
    private pausedReminderRepo: PausedReminderRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private loggerService: LoggerContract
  ) {
    super();

    this.existsInvoiceWithId = this.existsInvoiceWithId.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.pause = this.pause.bind(this);
  }

  @Authorize('reminder:toggle')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = await new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.pause)
        .execute();

      return execution;
    } catch (e) {
      return left(new UnexpectedError(e));
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
    const invoiceId = InvoiceId.create(uuid);

    return await this.invoiceRepo.existsWithId(invoiceId);
  }

  private async pause(
    request: DTO
  ): Promise<Either<Errors.SetReminderPauseDbError, null>> {
    this.loggerService.info(
      `Pause reminders of type ${NotificationType.REMINDER_PAYMENT} for invoice with id ${request.invoiceId}`
    );

    const uuid = new UniqueEntityID(request.invoiceId);
    const invoiceId = InvoiceId.create(uuid);

    try {
      const result = await this.pausedReminderRepo.setReminderPauseState(
        invoiceId,
        true,
        NotificationType.REMINDER_PAYMENT
      );

      if (result.isLeft()) {
        return left(
          new Errors.SetReminderPauseDbError(new Error(result.value.message))
        );
      }

      return right(null);
    } catch (e) {
      return left(new Errors.SetReminderPauseDbError(e));
    }
  }
}
