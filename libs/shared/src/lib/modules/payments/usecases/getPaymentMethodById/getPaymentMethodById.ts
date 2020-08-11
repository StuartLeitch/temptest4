/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { PaymentMethodRepoContract } from '../../repos/paymentMethodRepo';
import { PaymentMethodId } from '../../domain/PaymentMethodId';
import { PaymentMethod } from '../../domain/PaymentMethod';

// * Usecase specific
import { GetPaymentMethodByIdResponse } from './getPaymentMethodByIdResponse';
import { GetPaymentMethodByIdErrors } from './getPaymentMethodByIdErrors';
import { GetPaymentMethodByIdDTO } from './getPaymentMethodByIdDTO';

export class GetPaymentMethodByIdUsecase
  implements
    UseCase<
      GetPaymentMethodByIdDTO,
      Promise<GetPaymentMethodByIdResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetPaymentMethodByIdDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private paymentMethodRepo: PaymentMethodRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('payment-method:read')
  public async execute(
    request: GetPaymentMethodByIdDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetPaymentMethodByIdResponse> {
    const paymentMethodId = request.paymentMethodId;

    try {
      try {
        const paymentMethod = await this.paymentMethodRepo.getPaymentMethodById(
          PaymentMethodId.create(new UniqueEntityID(paymentMethodId))
        );

        return right(Result.ok<PaymentMethod>(paymentMethod));
      } catch (e) {
        return left(
          new GetPaymentMethodByIdErrors.NoPaymentMethodFound(paymentMethodId)
        );
      }
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }
}
