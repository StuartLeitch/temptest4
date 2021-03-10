/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// * Core Domain
import { Either, left, right } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

import {
  UsecaseAuthorizationContext,
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

type Context = UsecaseAuthorizationContext;

export class GetPaymentByForeignPaymentIdUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private paymentRepo: PaymentRepoContract) {
    this.validateRequest = this.validateRequest.bind(this);
    this.attachPayment = this.attachPayment.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
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
      const payment = await this.paymentRepo.getPaymentByForeignId(
        ExternalOrderId.create(request.foreignPaymentId)
      );

      return right({ ...request, payment });
    } catch (e) {
      return left(new Errors.DbCommunicationError(e, request.foreignPaymentId));
    }
  }
}
