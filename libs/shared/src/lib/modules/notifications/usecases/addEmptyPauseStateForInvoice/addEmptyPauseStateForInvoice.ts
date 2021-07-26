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

import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { NotificationPause } from '../../domain/NotificationPause';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';

// * Usecase specific
import { AddEmptyPauseStateForInvoiceResponse as Response } from './addEmptyPauseStateForInvoiceResponse';
import type { AddEmptyPauseStateForInvoiceDTO as DTO } from './addEmptyPauseStateForInvoiceDTO';
import * as Errors from './addEmptyPauseStateForInvoiceErrors';

export class AddEmptyPauseStateForInvoiceUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private pausedReminderRepo: PausedReminderRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private loggerService: LoggerContract
  ) {
    super();

    this.addNewPauseInstance = this.addNewPauseInstance.bind(this);
    this.existsInvoiceWithId = this.existsInvoiceWithId.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
  }

  @Authorize('reminders:add')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.addNewPauseInstance)
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

    const result = await this.invoiceRepo.existsWithId(invoiceId);

    if (result.isRight()) {
      return result.value;
    } else {
      throw new Error(result.value.message);
    }
  }

  private async addNewPauseInstance(
    request: DTO
  ): Promise<Either<Errors.AddPauseDbError, NotificationPause>> {
    this.loggerService.info(
      `Add empty pause settings for invoice with id ${request.invoiceId}`
    );

    const uuid = new UniqueEntityID(request.invoiceId);
    const invoiceId = InvoiceId.create(uuid);

    try {
      const result = await this.pausedReminderRepo.insertBasePause(invoiceId);

      if (result.isLeft()) {
        return left(
          new Errors.AddPauseDbError(
            request.invoiceId,
            new Error(result.value.message)
          )
        );
      }

      return right(result.value);
    } catch (e) {
      return left(new Errors.AddPauseDbError(request.invoiceId, e));
    }
  }
}
