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

import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';

// * Usecase specific
import { PauseInvoiceRemindersResponse as Response } from './pauseInvoiceRemindersResponse';
import { PauseInvoiceRemindersErrors as Errors } from './pauseInvoiceRemindersErrors';
import { PauseInvoiceRemindersDTO as DTO } from './pauseInvoiceRemindersDTO';

type Context = AuthorizationContext<Roles>;
export type PauseInvoiceRemindersContext = Context;

export class PauseInvoiceRemindersUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private sentNotificationRepo: SentNotificationRepoContract,
    private invoiceRepo: InvoiceRepoContract
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

  private async existsInvoiceWithId(id: string) {
    const uuid = new UniqueEntityID(id);
    const invoiceId = InvoiceId.create(uuid).getValue();
    return await this.invoiceRepo.existsWithId(invoiceId);
  }

  private async validateRequest(
    request: DTO
  ): Promise<
    Either<Errors.InvoiceIdRequiredError | Errors.InvoiceNotFoundError, DTO>
  > {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    if (!(await this.existsInvoiceWithId(request.invoiceId))) {
      return left(new Errors.InvoiceNotFoundError(request.invoiceId));
    }

    return right(request);
  }

  private async pause(
    request: DTO
  ): Promise<Either<Errors.SetReminderPauseDbError, null>> {
    const uuid = new UniqueEntityID(request.invoiceId);
    const invoiceId = InvoiceId.create(uuid).getValue();
    const { confirmation, payment } = request;

    try {
      await this.sentNotificationRepo.setNotificationPausedStatus({
        confirmation: !!confirmation,
        payment: !!payment,
        invoiceId
      });
      return right(null);
    } catch (e) {
      return left(new Errors.SetReminderPauseDbError(e));
    }
  }
}
