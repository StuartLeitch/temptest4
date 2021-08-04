// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { PaymentMethodRepoContract } from '../../repos/paymentMethodRepo';

// * Usecase specific
import { GetPaymentMethodByNameResponse as Response } from './getPaymentMethodByNameResponse';
import type { GetPaymentMethodByNameDTO as DTO } from './getPaymentMethodByNameDTO';
import * as Errors from './getPaymentMethodByNameErrors';

export class GetPaymentMethodByNameUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private paymentMethodRepo: PaymentMethodRepoContract) {
    super();
  }

  @Authorize('paymentMethod:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const searchedName = request.name;

    if (!searchedName) {
      return left(new Errors.SearchNameMustNotBeEmpty());
    }

    try {
      try {
        const maybePaymentMethods = await this.paymentMethodRepo.getPaymentMethodCollection();

        if (maybePaymentMethods.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybePaymentMethods.value.message))
          );
        }

        const paymentMethods = maybePaymentMethods.value;

        const methodsWithName = paymentMethods.filter(
          (method) => method.name.indexOf(searchedName) > -1
        );

        if (methodsWithName.length === 0) {
          throw new Error('no payment method with name');
        }

        return right(methodsWithName[0]);
      } catch (e) {
        return left(new Errors.NoPaymentMethodFound(searchedName));
      }
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }
}
