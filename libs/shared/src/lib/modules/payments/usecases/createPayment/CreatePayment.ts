/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { CreatePaymentResponse } from './CreatePaymentResponse';
import { CreatePaymentDTO } from './CreatePaymentDTO';

import { Payment } from '../../domain/Payment';
import { PaymentRepoContract } from '../../repos/paymentRepo';

export class CreatePaymentUsecase
  implements
    UseCase<
      CreatePaymentDTO,
      Promise<CreatePaymentResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      CreatePaymentDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private paymentRepo: PaymentRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('payment:create')
  public async execute(
    request: CreatePaymentDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<CreatePaymentResponse> {
    const paymentProps = {
      // status: TransactionStatus.DRAFT
    } as any;

    try {
      // * System creates a new payment
      const paymentOrError: Result<Payment> = Payment.create(paymentProps);

      if (paymentOrError.isFailure) {
        return left(paymentOrError);
      }

      const payment = paymentOrError.getValue();

      await this.paymentRepo.save(payment);

      return right(Result.ok<Payment>(payment));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
