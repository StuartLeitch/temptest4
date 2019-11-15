// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';

import {
  PaymentMethodMap,
  PaymentMethodPersistenceDTO
} from '../../mapper/PaymentMethod';
import { GetPaymentMethodsResponse } from './GetPaymentMethodsResponse';
import { PaymentMethodRepoContract } from '../../repos/paymentMethodRepo';

export class GetPaymentMethodsUseCase
  implements UseCase<undefined, Promise<GetPaymentMethodsResponse>> {
  constructor(private paymentMethodRepo: PaymentMethodRepoContract) {}

  public async execute(): Promise<GetPaymentMethodsResponse> {
    let paymentMethods: PaymentMethodPersistenceDTO[];

    try {
      paymentMethods = (await this.paymentMethodRepo.getPaymentMethods()).map(
        PaymentMethodMap.toPersistence
      );

      return right(Result.ok<PaymentMethodPersistenceDTO[]>(paymentMethods));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
