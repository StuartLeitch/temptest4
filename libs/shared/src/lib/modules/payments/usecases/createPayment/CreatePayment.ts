/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, left, right } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

import {
  UsecaseAuthorizationContext as Context,
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';
import { Roles } from '../../../users/domain/enums/Roles';

import { PaymentRepoContract } from '../../repos/paymentRepo';

import { PaymentStatus, PaymentProps, Payment } from '../../domain/Payment';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { PaymentMethodId } from '../../domain/PaymentMethodId';
import { PayerId } from '../../../payers/domain/PayerId';
import { Amount } from '../../../../domain/Amount';

import { CreatePaymentResponse as Response } from './CreatePaymentResponse';
import { CreatePaymentDTO as DTO } from './CreatePaymentDTO';
import * as Errors from './CreatePaymentErrors';

type ValidationErrors =
  | Errors.ForeignPaymentIdRequiredError
  | Errors.PaymentMethodIdRequiredError
  | Errors.StatusInvalidValueError
  | Errors.InvoiceIdRequiredError
  | Errors.PayerIdRequiredError
  | Errors.AmountRequiredError
  | Errors.StatusRequiredError;

interface WithPayment {
  payment: Payment;
}

interface DomainEventsDispatchData extends WithPayment {
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
    if (!(request.status in PaymentStatus)) {
      return left(new Errors.StatusInvalidValueError(request.status));
    }

    return right(request);
  }

  private async createPayment<T extends DTO>(
    request: T
  ): Promise<Either<Errors.PaymentCreationError, T & { payment: Payment }>> {
    const data: PaymentProps = {
      paymentMethodId: PaymentMethodId.create(
        new UniqueEntityID(request.paymentMethodId)
      ),
      invoiceId: InvoiceId.create(
        new UniqueEntityID(request.invoiceId)
      ).getValue(),
      datePaid: request.datePaid ? new Date(request.datePaid) : null,
      payerId: PayerId.create(new UniqueEntityID(request.payerId)),
      amount: Amount.create(request.amount).getValue(),
      foreignPaymentId: request.foreignPaymentId,
      status: PaymentStatus[request.status],
    };

    try {
      return right({ ...request, payment: Payment.create(data).getValue() });
    } catch (e) {
      return left(new Errors.PaymentCreationError(e));
    }
  }

  private setAndDispatchEvents<T extends DomainEventsDispatchData>(request: T) {
    const { payment, status } = request;

    if (status === PaymentStatus.COMPLETED) {
      payment.movedToCompleted();
    }

    DomainEvents.dispatchEventsForAggregate(payment.id);

    return request;
  }

  private async savePayment<T extends WithPayment>(request: T) {
    try {
      const payment = await this.paymentRepo.save(request.payment);
      return right({ ...request, payment });
    } catch (e) {
      return left(new Errors.PaymentSavingDbError(e));
    }
  }
}
