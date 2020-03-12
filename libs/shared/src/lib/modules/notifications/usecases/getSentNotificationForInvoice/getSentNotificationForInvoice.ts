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

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { Notification } from '../../domain/Notification';

// * Usecase specific
import { GetSentNotificationForInvoiceResponse as Response } from './getSentNotificationForInvoiceResponse';
import { GetSentNotificationForInvoiceErrors as Errors } from './getSentNotificationForInvoiceErrors';
import { GetSentNotificationForInvoiceDTO as DTO } from './getSentNotificationForInvoiceDTO';

type Context = AuthorizationContext<Roles>;
export type GetSentNotificationForInvoiceContext = Context;

export class GetSentNotificationForInvoiceUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private sentNotificationRepo: SentNotificationRepoContract) {
    this.fetchNotifications = this.fetchNotifications.bind(this);
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
        .then(this.fetchNotifications)
        .map(notifications => Result.ok(notifications));

      return execution.execute();
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }

  private async validateRequest(
    request: DTO
  ): Promise<Either<Errors.InvoiceIdRequired, DTO>> {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequired());
    }

    return right(request);
  }

  private async fetchNotifications(
    request: DTO
  ): Promise<Either<Errors.EncounteredDbError, Notification[]>> {
    const uuid = new UniqueEntityID(request.invoiceId);
    const invoiceId = InvoiceId.create(uuid).getValue();
    try {
      const results = await this.sentNotificationRepo.getNotificationsByInvoiceId(
        invoiceId
      );
      return right(results);
    } catch (e) {
      return left(new Errors.EncounteredDbError(invoiceId.id.toString(), e));
    }
  }
}
