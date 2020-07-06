/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// * Core Domain
import { Either, left, right } from '../../../../core/logic/Either';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { AppError } from '../../../../core/logic/AppError';
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

import { GetPaymentsByInvoiceIdUsecase } from '../getPaymentsByInvoiceId';

import { PayPalPaymentApprovedResponse as Response } from './paypal-payment-approved.response';
import { PayPalPaymentApprovedDTO as DTO } from './paypal-payment-approved.dto';
import * as Errors from './paypal-payment-approved.errors';

interface WithInvoiceIdAndOrderId {
  payPalOrderId: string;
  invoiceId: string;
}

interface WithPayment {
  payment: Payment;
}

type Context = AuthorizationContext<Roles>;
export type PayPalPaymentApprovedContext = Context;

export class PayPalPaymentApprovedUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private paymentRepo: PaymentRepoContract
  ) {
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
      return new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.attachPayment(context))
        .map(this.updatePaymentStatus)
        .then(this.savePaymentChanges)
        .map(() => null)
        .execute();
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }

  private async validateRequest<T extends DTO>(
    request: T
  ): Promise<
    Either<Errors.PayPalOrderIdRequiredError | Errors.InvoiceIdRequiredError, T>
  > {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }
    if (!request.payPalOrderId) {
      return left(new Errors.PayPalOrderIdRequiredError());
    }

    return right(request);
  }

  private attachPayment(context: Context) {
    return async <T extends WithInvoiceIdAndOrderId>(request: T) => {
      const usecase = new GetPaymentsByInvoiceIdUsecase(
        this.invoiceRepo,
        this.paymentRepo
      );

      return new AsyncEither(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((result) => result.getValue())
        .map((payments) =>
          payments.find(
            (payment) => payment.foreignPaymentId === request.payPalOrderId
          )
        )
        .map((payment) => ({ ...request, payment }))
        .execute();
    };
  }

  private updatePaymentStatus<T extends WithPayment>(request: T) {
    request.payment.status = PaymentStatus.PENDING;

    return request;
  }

  private async savePaymentChanges<T extends WithPayment>(request: T) {
    try {
      const payment = await this.paymentRepo.updatePayment(request.payment);
      return right({ ...request, payment });
    } catch (e) {
      return left(new Errors.SavingNewStatusForPaymentDbError(e));
    }
  }
}
