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

import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { Notification } from '../../domain/Notification';

// * Usecase specific
import { GetRemindersPauseStateForInvoiceResponse as Response } from './getRemindersPauseStateForInvoiceResponse';
import { GetRemindersPauseStateForInvoiceErrors as Errors } from './getRemindersPauseStateForInvoiceErrors';
import { GetRemindersPauseStateForInvoiceDTO as DTO } from './getRemindersPauseStateForInvoiceDTO';
import { NotificationPause } from '../../domain/NotificationPause';

type Context = AuthorizationContext<Roles>;
export type GetRemindersPauseStateForInvoiceContext = Context;

export class GetRemindersPauseStateForInvoiceUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private pausedRemindersRepo: PausedReminderRepoContract,
    private invoiceRepo: InvoiceRepoContract
  ) {
    this.existsInvoiceWithId = this.existsInvoiceWithId.bind(this);
    this.fetchPauseState = this.fetchPauseState.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither<null, DTO>(request)
        .then(this.validateRequest)
        .then(this.fetchPauseState)
        .map(notifications => Result.ok(notifications));

      return execution.execute();
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }

  private async validateRequest(
    request: DTO
  ): Promise<Either<Errors.InvoiceIdRequiredError, DTO>> {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    if (!(await this.existsInvoiceWithId(request.invoiceId))) {
      return left(new Errors.InvoiceNotFoundError(request.invoiceId));
    }

    return right(request);
  }

  private async existsInvoiceWithId(id: string) {
    const uuid = new UniqueEntityID(id);
    const invoiceId = InvoiceId.create(uuid).getValue();
    return await this.invoiceRepo.existsWithId(invoiceId);
  }

  private async fetchPauseState(
    request: DTO
  ): Promise<Either<Errors.GetRemindersPauseDbError, NotificationPause>> {
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
