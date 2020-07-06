/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// * Core Domain
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

import { GetPaymentsByInvoiceIdUsecase } from '../getPaymentsByInvoiceId';

import { PayPalProcessFinishedResponse as Response } from './paypal-process-finished.response';
import { PayPalProcessFinishedDTO as DTO } from './paypal-process-finished.dto';
import * as Errors from './paypal-process-finished.errors';

interface WithInvoiceIdAndOrderId {
  payPalOrderId: string;
  invoiceId: string;
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
    this.validateRequest = this.validateRequest.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('payments:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const result = await new AsyncEither(request)
        .then(this.validateRequest)
        .map(() => null)
        .execute();
      return result;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async validateRequest<T extends DTO>(
    request: T
  ): Promise<Either<Errors.OrderIdRequiredError, T>> {
    if (!request.orderId) {
      return left(new Errors.OrderIdRequiredError());
    }

    return right(request);
  }
}
