// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
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

import { PaymentStatus, PaymentProps, Payment } from '../../domain/Payment';
import { ExternalOrderId } from '../../domain/external-order-id';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { PaymentMethodId } from '../../domain/PaymentMethodId';
import { PayerId } from '../../../payers/domain/PayerId';
import { Amount } from '../../../../domain/Amount';

import { PaymentRepoContract } from '../../repos/paymentRepo';

import { CreatePaymentResponse as Response } from './CreatePaymentResponse';
import type { CreatePaymentDTO as DTO } from './CreatePaymentDTO';
import * as Errors from './CreatePaymentErrors';

type ValidationErrors =
  | Errors.ForeignPaymentIdRequiredError
  | Errors.PaymentMethodIdRequiredError
  | Errors.IsFinalPaymentRequiredError
  | Errors.StatusInvalidValueError
  | Errors.InvoiceIdRequiredError
  | Errors.PayerIdRequiredError
  | Errors.AmountRequiredError
  | Errors.StatusRequiredError;

interface WithPayment {
  payment: Payment;
}

interface DomainEventsDispatchData extends WithPayment {
  isFinalPayment: boolean;
  status: string;
}

export class CreatePaymentUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private paymentRepo: PaymentRepoContract) {
    this.setAndDispatchEvents = this.setAndDispatchEvents.bind(this);
    this.validateRequired = this.validateRequired.bind(this);
    this.createPayment = this.createPayment.bind(this);
    this.savePayment = this.savePayment.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('payments:create')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const result = await new AsyncEither(request)
        .then(this.validateRequired)
        .then(this.createPayment)
        .then(this.savePayment)
        .map(this.setAndDispatchEvents)
        .map((request) => request.payment)
        .execute();
      return result;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async validateRequired<T extends DTO>(
    request: T
  ): Promise<Either<ValidationErrors, T>> {
    if (!request.amount) {
      return left(new Errors.AmountRequiredError());
    }
    if (!request.foreignPaymentId) {
      return left(new Errors.ForeignPaymentIdRequiredError());
    }
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }
    if (!request.payerId) {
      return left(new Errors.PayerIdRequiredError());
    }
    if (!request.paymentMethodId) {
      return left(new Errors.PaymentMethodIdRequiredError());
    }
    if (!request.status) {
      return left(new Errors.StatusRequiredError());
    }
    if (request.isFinalPayment == null) {
      return left(new Errors.IsFinalPaymentRequiredError());
    }
    if (!(request.status in PaymentStatus)) {
      return left(new Errors.StatusInvalidValueError(request.status));
    }

    return right(request);
  }

  private async createPayment<T extends DTO>(
    request: T
  ): Promise<Either<Errors.PaymentCreationError, T & { payment: Payment }>> {
    const maybeAmount = Amount.create(request.amount);

    if (maybeAmount.isLeft()) {
      return left(new UnexpectedError(new Error(maybeAmount.value.message)));
    }

    const data: PaymentProps = {
      paymentMethodId: PaymentMethodId.create(
        new UniqueEntityID(request.paymentMethodId)
      ),
      invoiceId: InvoiceId.create(new UniqueEntityID(request.invoiceId)),
      datePaid: request.datePaid ? new Date(request.datePaid) : null,
      payerId: PayerId.create(new UniqueEntityID(request.payerId)),
      amount: maybeAmount.value,
      foreignPaymentId: ExternalOrderId.create(request.foreignPaymentId),
      status: PaymentStatus[request.status],
    };

    const maybePayment = Payment.create(data);

    if (maybePayment.isLeft()) {
      return left(new UnexpectedError(new Error(maybePayment.value.message)));
    }

    try {
      return right({ ...request, payment: maybePayment.value });
    } catch (e) {
      return left(new Errors.PaymentCreationError(e));
    }
  }

  private setAndDispatchEvents<T extends DomainEventsDispatchData>(request: T) {
    const { payment, status, isFinalPayment } = request;

    if (status === PaymentStatus.COMPLETED) {
      payment.addCompletedEvent(isFinalPayment);
    }

    DomainEvents.dispatchEventsForAggregate(payment.id);

    return request;
  }

  private async savePayment<T extends WithPayment>(
    request: T
  ): Promise<Either<Errors.PaymentSavingDbError, T & { payment: Payment }>> {
    try {
      const payment = await this.paymentRepo.save(request.payment);

      if (payment.isLeft()) {
        return left(new UnexpectedError(new Error(payment.value.message)));
      }

      return right({ ...request, payment: payment.value });
    } catch (e) {
      return left(new Errors.PaymentSavingDbError(e));
    }
  }
}
