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

import { NotificationPause } from '../../domain/NotificationPause';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';

// * Usecase specific
import { AddEmptyPauseStateForInvoiceResponse as Response } from './addEmptyPauseStateForInvoiceResponse';
import { AddEmptyPauseStateForInvoiceErrors as Errors } from './addEmptyPauseStateForInvoiceErrors';
import { AddEmptyPauseStateForInvoiceDTO as DTO } from './addEmptyPauseStateForInvoiceDTO';

type Context = AuthorizationContext<Roles>;
export type AddEmptyPauseStateForInvoiceContext = Context;

export class AddEmptyPauseStateForInvoiceUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private pausedReminderRepo: PausedReminderRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private loggerService: LoggerContract
  ) {
    this.addNewPauseInstance = this.addNewPauseInstance.bind(this);
    this.existsInvoiceWithId = this.existsInvoiceWithId.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.addNewPauseInstance)
        .map(val => Result.ok(val));

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

  private async addNewPauseInstance(
    request: DTO
  ): Promise<Either<Errors.AddPauseDbError, NotificationPause>> {
    this.loggerService.info(
      `Add empty pause settings for invoice with id ${request.invoiceId}`
    );

    const uuid = new UniqueEntityID(request.invoiceId);
    const invoiceId = InvoiceId.create(uuid).getValue();

    try {
      const result = await this.pausedReminderRepo.insertBasePause(invoiceId);
      return right(result);
    } catch (e) {
      return left(new Errors.AddPauseDbError(request.invoiceId, e));
    }
  }
}
