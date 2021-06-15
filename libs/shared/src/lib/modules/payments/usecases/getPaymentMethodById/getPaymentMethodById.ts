// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

import { PaymentMethodId } from '../../domain/PaymentMethodId';

import { PaymentMethodRepoContract } from '../../repos/paymentMethodRepo';

// * Usecase specific
import { GetPaymentMethodByIdResponse as Response } from './getPaymentMethodByIdResponse';
import { GetPaymentMethodByIdDTO as DTO } from './getPaymentMethodByIdDTO';
import * as Errors from './getPaymentMethodByIdErrors';

export class GetPaymentMethodByIdUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private paymentMethodRepo: PaymentMethodRepoContract) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    const paymentMethodId = request.paymentMethodId;

    try {
      try {
        const maybePaymentMethod = await this.paymentMethodRepo.getPaymentMethodById(
          PaymentMethodId.create(new UniqueEntityID(paymentMethodId))
        );

        if (maybePaymentMethod.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybePaymentMethod.value.message))
          );
        }

        return right(maybePaymentMethod.value);
      } catch (e) {
        return left(new Errors.NoPaymentMethodFound(paymentMethodId));
      }
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }
}
