// * Core Domain
import { Either, left, right } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { ExternalOrderId } from '../../domain/external-order-id';
import { Payment } from '../../domain/Payment';

import { PaymentRepoContract } from '../../repos/paymentRepo';

import { GetPaymentByForeignPaymentIdResponse as Response } from './get-payment-by-foreign-payment-id.response';
import type { GetPaymentByForeignPaymentIdDTO as DTO } from './get-payment-by-foreign-payment-id.dto';
import * as Errors from './get-payment-by-foreign-payment-id.errors';

interface WithForeignId {
  foreignPaymentId: string;
}

export class GetPaymentByForeignPaymentIdUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private paymentRepo: PaymentRepoContract) {
    super();

    this.validateRequest = this.validateRequest.bind(this);
    this.attachPayment = this.attachPayment.bind(this);
  }

  @Authorize('payments:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const result = await new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.attachPayment)
        .map((request) => request.payment)
        .execute();
      return result;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async validateRequest<T extends DTO>(
    request: T
  ): Promise<Either<Errors.ForeignPaymentIdRequiredError, T>> {
    if (!request.foreignPaymentId) {
      return left(new Errors.ForeignPaymentIdRequiredError());
    }

    return right(request);
  }

  private async attachPayment<T extends WithForeignId>(
    request: T
  ): Promise<Either<Errors.DbCommunicationError, T & { payment: Payment }>> {
    try {
      const maybePayment = await this.paymentRepo.getPaymentByForeignId(
        ExternalOrderId.create(request.foreignPaymentId)
      );

      if (maybePayment.isLeft()) {
        return left(new UnexpectedError(new Error(maybePayment.value.message)));
      }

      return right({ ...request, payment: maybePayment.value });
    } catch (e) {
      return left(new Errors.DbCommunicationError(e, request.foreignPaymentId));
    }
  }
}
