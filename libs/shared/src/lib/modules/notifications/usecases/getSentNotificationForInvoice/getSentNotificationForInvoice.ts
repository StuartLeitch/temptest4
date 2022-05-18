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
import { Notification } from '../../domain/Notification';

import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';

import { LoggerContract } from '../../../../infrastructure/logging';

// * Usecase specific
import { GetSentNotificationForInvoiceResponse as Response } from './getSentNotificationForInvoiceResponse';
import type { GetSentNotificationForInvoiceDTO as DTO } from './getSentNotificationForInvoiceDTO';
import * as Errors from './getSentNotificationForInvoiceErrors';

export class GetSentNotificationForInvoiceUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(
    private sentNotificationRepo: SentNotificationRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private loggerService: LoggerContract
  ) {
    super();

    this.existsInvoiceWithId = this.existsInvoiceWithId.bind(this);
    this.fetchNotifications = this.fetchNotifications.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
  }

  @Authorize('reminder:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = await new AsyncEither<null, DTO>(request)
        .then(this.validateRequest)
        .then(this.fetchNotifications)
        .execute();

      return execution;
    } catch (e) {
      return left(new UnexpectedError(e));
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
    const invoiceId = InvoiceId.create(uuid);

    return await this.invoiceRepo.existsWithId(invoiceId);
  }

  private async fetchNotifications(
    request: DTO
  ): Promise<Either<Errors.EncounteredDbError, Notification[]>> {
    this.loggerService.info(
      `Fetch the notifications sent for invoice with id ${request.invoiceId}`
    );

    const uuid = new UniqueEntityID(request.invoiceId);
    const invoiceId = InvoiceId.create(uuid);
    try {
      const results =
        await this.sentNotificationRepo.getNotificationsByInvoiceId(invoiceId);

      if (results.isLeft()) {
        return left(
          new Errors.EncounteredDbError(
            invoiceId.toString(),
            new Error(results.value.message)
          )
        );
      }

      return right(results.value);
    } catch (e) {
      return left(new Errors.EncounteredDbError(invoiceId.toString(), e));
    }
  }
}
