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
import { GetPaymentMethodByIdResponse } from './getPaymentMethodByIdResponse';
import { GetPaymentMethodByIdErrors } from './getPaymentMethodByIdErrors';
import { GetPaymentMethodByIdDTO } from './getPaymentMethodByIdDTO';

export type GetPaymentMethodByIdContext = AuthorizationContext<Roles>;

export class GetPaymentMethodByIdUsecase
  implements
    UseCase<
      GetPaymentMethodByIdDTO,
      Promise<GetPaymentMethodByIdResponse>,
      GetPaymentMethodByIdContext
    >,
    AccessControlledUsecase<
      GetPaymentMethodByIdDTO,
      GetPaymentMethodByIdContext,
      AccessControlContext
    > {
  constructor(private paymentMethodRepo: PaymentMethodRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('payment-method:read')
  public async execute(
    request: GetPaymentMethodByIdDTO,
    context?: GetPaymentMethodByIdContext
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
      return left(new AppError.UnexpectedError(e));
    }
  }
}
