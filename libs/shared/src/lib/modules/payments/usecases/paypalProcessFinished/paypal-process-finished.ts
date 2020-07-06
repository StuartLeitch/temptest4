/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { Either, left, right } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize,
} from '../../../../domain/authorization/decorators/Authorize';

import { PaymentStatus, Payment } from '../../domain/Payment';

import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { PaymentRepoContract } from '../../repos/paymentRepo';

import { GetPaymentByForeignPaymentIdUsecase } from '../getPaymentByForeignPaymentId';

import { PayPalProcessFinishedResponse as Response } from './paypal-process-finished.response';
import { PayPalProcessFinishedDTO as DTO } from './paypal-process-finished.dto';
import * as Errors from './paypal-process-finished.errors';

interface WithOrderId {
  orderId: string;
}

interface WithOrderStatus {
  payPalOrderStatus: string;
}

interface WithPayment {
  payment: Payment;
}

type Context = AuthorizationContext<Roles>;
export type PayPalProcessFinishedContext = Context;

export class PayPalProcessFinishedUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private paymentRepo: PaymentRepoContract
  ) {
    this.setAndDispatchEvents = this.setAndDispatchEvents.bind(this);
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
        .map(this.updatePaymentStatus)
        .then(this.savePaymentChanges)
        .map(this.setAndDispatchEvents)
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
    if (!request.orderId) {
      return left(new Errors.OrderIdRequiredError());
    }

    if (!request.payPalOrderStatus) {
      return left(new Errors.PayPalOrderStatusRequiredError());
    }

    return right(request);
  }

  private updatePaymentStatus<T extends WithOrderStatus & WithPayment>(
    request: T
  ) {
    let paymentStatus: PaymentStatus;

    if (request.payPalOrderStatus === 'completed') {
      paymentStatus = PaymentStatus.COMPLETED;
    } else if (request.payPalOrderStatus === 'reverted') {
      paymentStatus = PaymentStatus.FAILED;
    }

    request.payment.status = paymentStatus;

    return request;
  }

  private attachPayment(context: Context) {
    return async <T extends WithOrderId>(request: T) => {
      const usecase = new GetPaymentByForeignPaymentIdUsecase(this.paymentRepo);

      return new AsyncEither(request.orderId)
        .then((foreignPaymentId) =>
          usecase.execute({ foreignPaymentId }, context)
        )
        .map((payment) => ({ ...request, payment }))
        .execute();
    };
  }

  private async savePaymentChanges<T extends WithPayment>(request: T) {
    try {
      const payment = this.paymentRepo.updatePayment(request.payment);

      return right({ ...request, payment });
    } catch (e) {
      return left(new Errors.UpdatePaymentStatusDbError(e));
    }
  }

  private setAndDispatchEvents<T extends WithPayment>(request: T) {
    const { payment } = request;

    if (payment.status === PaymentStatus.COMPLETED) {
      payment.movedToCompleted();
    }

    DomainEvents.dispatchEventsForAggregate(payment.id);

    return request;
  }
}
