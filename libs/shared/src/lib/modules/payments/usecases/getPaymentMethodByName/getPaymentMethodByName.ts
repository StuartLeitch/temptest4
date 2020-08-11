/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { PaymentMethodRepoContract } from '../../repos/paymentMethodRepo';

// * Usecase specific
import { GetPaymentMethodByNameResponse } from './getPaymentMethodByNameResponse';
import { GetPaymentMethodByNameErrors } from './getPaymentMethodByNameErrors';
import { GetPaymentMethodByNameDTO } from './getPaymentMethodByNameDTO';

export class GetPaymentMethodByNameUsecase
  implements
    UseCase<
      GetPaymentMethodByNameDTO,
      Promise<GetPaymentMethodByNameResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetPaymentMethodByNameDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private paymentMethodRepo: PaymentMethodRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('payment-method:read')
  public async execute(
    request: GetPaymentMethodByNameDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetPaymentMethodByNameResponse> {
    const searchedName = request.name;

    if (!searchedName) {
      return left(new GetPaymentMethodByNameErrors.SearchNameMustNotBeEmpty());
    }

    try {
      try {
        const paymentMethods = await this.paymentMethodRepo.getPaymentMethodCollection();
        const methodsWithName = paymentMethods.filter(
          (method) => method.name.indexOf(searchedName) > -1
        );

        if (methodsWithName.length === 0) {
          throw new Error('no payment method with name');
        }

        return right(Result.ok(methodsWithName[0]));
      } catch (e) {
        return left(
          new GetPaymentMethodByNameErrors.NoPaymentMethodFound(searchedName)
        );
      }
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }
}
