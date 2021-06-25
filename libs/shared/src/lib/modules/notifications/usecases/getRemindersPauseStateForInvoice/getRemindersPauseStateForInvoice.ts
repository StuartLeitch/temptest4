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

import { NotificationPause } from '../../domain/NotificationPause';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';

import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';

// * Usecase specific
import { GetRemindersPauseStateForInvoiceResponse as Response } from './getRemindersPauseStateForInvoiceResponse';
import { GetRemindersPauseStateForInvoiceDTO as DTO } from './getRemindersPauseStateForInvoiceDTO';
import * as Errors from './getRemindersPauseStateForInvoiceErrors';

export class GetRemindersPauseStateForInvoiceUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private pausedRemindersRepo: PausedReminderRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private loggerService: LoggerContract
  ) {
    super();

    this.existsInvoiceWithId = this.existsInvoiceWithId.bind(this);
    this.fetchPauseState = this.fetchPauseState.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
  }

  @Authorize('reminder:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = await new AsyncEither<null, DTO>(request)
        .then(this.validateRequest)
        .then(this.fetchPauseState)
        .execute();

      return execution;
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }

  private async validateRequest(
    request: DTO
  ): Promise<Either<Errors.InvoiceIdRequiredError, DTO>> {
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

  private async fetchPauseState(
    request: DTO
  ): Promise<Either<Errors.GetRemindersPauseDbError, NotificationPause>> {
    this.loggerService.info(
      `Fetch the reminders pause state for invoice with id ${request.invoiceId}`
    );

    const uuid = new UniqueEntityID(request.invoiceId);
    const invoiceId = InvoiceId.create(uuid);

    try {
      const result = await this.pausedRemindersRepo.getNotificationPausedStatus(
        invoiceId
      );

      if (result.isLeft()) {
        return left(
          new Errors.GetRemindersPauseDbError(new Error(result.value.message))
        );
      }

      return right(result.value);
    } catch (e) {
      return left(new Errors.GetRemindersPauseDbError(e));
    }
  }
}
