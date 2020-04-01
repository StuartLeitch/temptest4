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
  constructor(
    private paymentMethodRepo: PaymentMethodRepoContract,
    private loggerService: any
  ) {}

  public async execute(
    request?: any,
    context?: any
  ): Promise<GetPaymentMethodsResponse> {
    let paymentMethods: PaymentMethodPersistenceDTO[];
    // console.info(context);
    // console.info(this.paymentMethodRepo);
    (this.paymentMethodRepo as any).correlationId = context.correlationId;

    this.loggerService.debug('GetPaymentMethodsUseCase', { request, context });

    try {
      paymentMethods = (await this.paymentMethodRepo.getPaymentMethods()).map(
        PaymentMethodMap.toPersistence
      );

      this.loggerService.debug('GetPaymentMethodsUseCase', {
        context,
        data: paymentMethods
      });

      return right(Result.ok<PaymentMethodPersistenceDTO[]>(paymentMethods));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
