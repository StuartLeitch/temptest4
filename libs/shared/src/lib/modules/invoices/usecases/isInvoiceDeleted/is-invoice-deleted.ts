// * Core Domain
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
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

import { InvoiceId } from '../../domain/InvoiceId';

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { IsInvoiceDeletedResponse as Response } from './is-invoice-deleted.response';
import type { IsInvoiceDeletedDTO as DTO } from './is-invoice-deleted.dto';
import * as Errors from './is-invoice-deleted.errors';

interface WithInvoiceId {
  invoiceId: string;
}

export class IsInvoiceDeletedUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private logger: LoggerContract
  ) {
    super();

    this.attachDeleteStatus = this.attachDeleteStatus.bind(this);
  }

  @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const aa = await new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.attachDeleteStatus)
        .map(({ isDeleted }) => isDeleted)
        .execute();

      return aa;
    } catch (err) {
      return left(new UnexpectedError(err, 'IsInvoiceDeletedUsecase'));
    }
  }

  private async validateRequest<T extends DTO>(
    request: T
  ): Promise<Either<Errors.InvoiceIdRequiredError, T>> {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    return right(request);
  }

  private async attachDeleteStatus<T extends WithInvoiceId>(
    request: T
  ): Promise<Either<Errors.InvoiceCheckDbError, T & { isDeleted: boolean }>> {
    const uuid = new UniqueEntityID(request.invoiceId);
    const invoiceId = InvoiceId.create(uuid);

    try {
      const rsp = await this.invoiceRepo.isInvoiceDeleted(invoiceId);

      if (rsp.isLeft()) {
        return left(new UnexpectedError(new Error(rsp.value.message)));
      }

      return right({ ...request, isDeleted: rsp.value });
    } catch (err) {
      return left(new Errors.InvoiceCheckDbError(err));
    }
  }
}
