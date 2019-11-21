// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import { PaymentMethodRepoContract } from '../../repos/paymentMethodRepo';
import { PaymentMethodId } from '../../domain/PaymentMethodId';
import { PaymentMethod } from '../../domain/PaymentMethod';

// * Usecase specific
import { GetPaymentMethodByNameResponse } from './getPaymentMethodByNameResponse';
import { GetPaymentMethodByNameErrors } from './getPaymentMethodByNameErrors';
import { GetPaymentMethodByNameDTO } from './getPaymentMethodByNameDTO';

export type GetPaymentMethodByNameContext = AuthorizationContext<Roles>;

export class GetPaymentMethodByNameUsecase
  implements
    UseCase<
      GetPaymentMethodByNameDTO,
      Promise<GetPaymentMethodByNameResponse>,
      GetPaymentMethodByNameContext
    >,
    AccessControlledUsecase<
      GetPaymentMethodByNameDTO,
      GetPaymentMethodByNameContext,
      AccessControlContext
    > {
  constructor(private paymentMethodRepo: PaymentMethodRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('payment-method:read')
  public async execute(
    request: GetPaymentMethodByNameDTO,
    context?: GetPaymentMethodByNameContext
  ): Promise<GetPaymentMethodByNameResponse> {
    const searchedName = request.name;

    if (!searchedName) {
      return left(new GetPaymentMethodByNameErrors.SearchNameMustNotBeEmpty());
    }

    try {
      try {
        const paymentMethods = await this.paymentMethodRepo.getPaymentMethodCollection();
        const methodsWithName = paymentMethods.filter(
          method => method.name.indexOf(searchedName) > -1
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
      return left(new AppError.UnexpectedError(e));
    }
  }
}
