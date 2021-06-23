// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
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

import { PaymentStatus, Payment } from '../../domain/Payment';

import { PaymentRepoContract } from '../../repos/paymentRepo';

import { GetPaymentByForeignPaymentIdUsecase } from '../getPaymentByForeignPaymentId';

import { PayPalProcessFinishedResponse as Response } from './paypal-process-finished.response';
import type { PayPalProcessFinishedDTO as DTO } from './paypal-process-finished.dto';
import * as Errors from './paypal-process-finished.errors';

interface WithPayPalOrderId {
  payPalOrderId: string;
}

interface WithPayPalEvent {
  payPalEvent: string;
}

interface WithPayment {
  payment: Payment;
}

export class PayPalProcessFinishedUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private paymentRepo: PaymentRepoContract) {
    this.dispatchEvents = this.dispatchEvents.bind(this);
    this.updatePaymentStatus = this.updatePaymentStatus.bind(this);
    this.savePaymentChanges = this.savePaymentChanges.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.attachPayment = this.attachPayment.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('payments:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const result = await new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.attachPayment(context))
        .then(this.shouldUpdatePaymentStatus)
        .map(this.updatePaymentStatus)
        .then(this.savePaymentChanges)
        .map(this.dispatchEvents)
        .map(() => null)
        .execute();
      return result;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async validateRequest<T extends DTO>(
    request: T
  ): Promise<
    Either<
      Errors.PayPalOrderStatusRequiredError | Errors.OrderIdRequiredError,
      T
    >
  > {
    if (!request.payPalOrderId) {
      return left(new Errors.OrderIdRequiredError());
    }

    if (!request.payPalEvent) {
      return left(new Errors.PayPalOrderStatusRequiredError());
    }

    return right(request);
  }

  private async shouldUpdatePaymentStatus<T extends WithPayment>(
    request: T
  ): Promise<
    Either<Errors.PaymentNotInCorrectStatusForTransitionToCompletedError, T>
  > {
    const { payment } = request;

    if (
      payment.status === PaymentStatus.COMPLETED ||
      payment.status === PaymentStatus.CREATED ||
      payment.status === PaymentStatus.FAILED
    ) {
      return left(
        new Errors.PaymentNotInCorrectStatusForTransitionToCompletedError(
          payment.invoiceId.toString(),
          payment.status
        )
      );
    }

    return right(request);
  }

  private updatePaymentStatus<T extends WithPayPalEvent & WithPayment>(
    request: T
  ) {
    if (request.payPalEvent === 'PAYMENT.CAPTURE.COMPLETED') {
      request.payment.markAsCompleted();
    } else if (
      request.payPalEvent === 'PAYMENT.CAPTURE.REFUNDED' ||
      request.payPalEvent === 'PAYMENT.CAPTURE.REVERSED' ||
      request.payPalEvent === 'PAYMENT.CAPTURE.DENIED'
    ) {
      request.payment.markAsFailed();
    }

    return request;
  }

  private attachPayment(context: Context) {
    return async <T extends WithPayPalOrderId>(request: T) => {
      const usecase = new GetPaymentByForeignPaymentIdUsecase(this.paymentRepo);

      return new AsyncEither(request.payPalOrderId)
        .then((foreignPaymentId) =>
          usecase.execute({ foreignPaymentId }, context)
        )
        .map((payment) => ({ ...request, payment }))
        .execute();
    };
  }

  private async savePaymentChanges<T extends WithPayment>(
    request: T
  ): Promise<Either<Errors.UpdatePaymentStatusDbError, T>> {
    try {
      const maybePayment = await this.paymentRepo.updatePayment(
        request.payment
      );

      if (maybePayment.isLeft()) {
        return left(new UnexpectedError(new Error(maybePayment.value.message)));
      }

      return right({ ...request, payment: maybePayment.value });
    } catch (e) {
      return left(new Errors.UpdatePaymentStatusDbError(e));
    }
  }

  private dispatchEvents<T extends WithPayment>(request: T) {
    const { payment } = request;

    DomainEvents.dispatchEventsForAggregate(payment.id);

    return request;
  }
}
