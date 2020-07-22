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

import { PaymentStatus, Payment } from '../../domain/Payment';
import { PaymentProof } from '../../domain/payment-proof';

import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { PaymentRepoContract } from '../../repos/paymentRepo';

import { GetPaymentsByInvoiceIdUsecase } from '../getPaymentsByInvoiceId';

import {
  PaymentStrategySelection,
  PaymentStrategyFactory,
} from '../../domain/strategies/payment-strategy-factory';

import { PayPalPaymentApprovedResponse as Response } from './paypal-payment-approved.response';
import { PayPalPaymentApprovedDTO as DTO } from './paypal-payment-approved.dto';
import * as Errors from './paypal-payment-approved.errors';

interface WithOrderId {
  payPalOrderId: string;
}

interface WithInvoiceIdAndOrderId extends WithOrderId {
  invoiceId: string;
}

interface WithProof {
  paymentProof: PaymentProof;
}

interface WithPayment {
  payment: Payment;
}

type Context = UsecaseAuthorizationContext;

export class PayPalPaymentApprovedUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private paymentRepo: PaymentRepoContract,
    private strategyFactory: PaymentStrategyFactory
  ) {
    this.updatePaymentStatus = this.updatePaymentStatus.bind(this);
    this.savePaymentChanges = this.savePaymentChanges.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.attachPayment = this.attachPayment.bind(this);
    this.captureMoney = this.captureMoney.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('payments:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      return new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.captureMoney)
        .then(this.attachPayment(context))
        .map(this.updatePaymentStatus)
        .then(this.savePaymentChanges)
        .map(() => null)
        .execute();
    } catch (err) {
      return left(new UnexpectedError(err));
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

  private async captureMoney<T extends WithOrderId>(request: T) {
    const paypalStrategy = await this.strategyFactory.getStrategy(
      PaymentStrategySelection.PayPal
    );

    return new AsyncEither(request.payPalOrderId)
      .then((orderId) => paypalStrategy.captureMoney({ orderId }))
      .map((paymentProof) => ({ ...request, paymentProof }))
      .execute();
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

  private updatePaymentStatus<T extends WithPayment & WithProof>(request: T) {
    request.payment.paymentProof = request.paymentProof;
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
