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
  Authorize,
} from '../../../../domain/authorization/decorators/Authorize';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { Notification } from '../../domain/Notification';

// * Usecase specific
import { GetSentNotificationForInvoiceResponse as Response } from './getSentNotificationForInvoiceResponse';
import { GetSentNotificationForInvoiceDTO as DTO } from './getSentNotificationForInvoiceDTO';
import * as Errors from './getSentNotificationForInvoiceErrors';

type Context = AuthorizationContext<Roles>;
export type GetSentNotificationForInvoiceContext = Context;

export class GetSentNotificationForInvoiceUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private sentNotificationRepo: SentNotificationRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private loggerService: LoggerContract
  ) {
    this.existsInvoiceWithId = this.existsInvoiceWithId.bind(this);
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
        .map((notifications) => Result.ok(notifications));

      return execution.execute();
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }

  private async validateRequest(
    request: DTO
  ): Promise<Either<Errors.InvoiceIdRequired, DTO>> {
    this.loggerService.info(`Validate usecase request data`);

    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequired());
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

  private async fetchNotifications(
    request: DTO
  ): Promise<Either<Errors.EncounteredDbError, Notification[]>> {
    this.loggerService.info(
      `Fetch the notifications sent for invoice with id ${request.invoiceId}`
    );

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
