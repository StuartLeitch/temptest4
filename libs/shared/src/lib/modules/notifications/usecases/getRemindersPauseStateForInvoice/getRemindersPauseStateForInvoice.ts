/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { Either, Result, right, left } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';

import { NotificationPause } from '../../domain/NotificationPause';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';

// * Usecase specific
import { GetRemindersPauseStateForInvoiceResponse as Response } from './getRemindersPauseStateForInvoiceResponse';
import { GetRemindersPauseStateForInvoiceDTO as DTO } from './getRemindersPauseStateForInvoiceDTO';
import * as Errors from './getRemindersPauseStateForInvoiceErrors';

export class GetRemindersPauseStateForInvoiceUsecase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private pausedRemindersRepo: PausedReminderRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private loggerService: LoggerContract
  ) {
    this.existsInvoiceWithId = this.existsInvoiceWithId.bind(this);
    this.fetchPauseState = this.fetchPauseState.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    try {
      const execution = new AsyncEither<null, DTO>(request)
        .then(this.validateRequest)
        .then(this.fetchPauseState)
        .map((notifications) => Result.ok(notifications));

      return execution.execute();
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
    const invoiceId = InvoiceId.create(uuid).getValue();

    return await this.invoiceRepo.existsWithId(invoiceId);
  }

  private async fetchPauseState(
    request: DTO
  ): Promise<Either<Errors.GetRemindersPauseDbError, NotificationPause>> {
    this.loggerService.info(
      `Fetch the reminders pause state for invoice with id ${request.invoiceId}`
    );

    const uuid = new UniqueEntityID(request.invoiceId);
    const invoiceId = InvoiceId.create(uuid).getValue();

    try {
      const result = await this.pausedRemindersRepo.getNotificationPausedStatus(
        invoiceId
      );
      return right(result);
    } catch (e) {
      return left(new Errors.GetRemindersPauseDbError(e));
    }
  }
}
