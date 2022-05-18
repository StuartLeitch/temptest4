// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import { LoggerContract } from '../../../../infrastructure/logging';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { PaymentMethodRepoContract } from '../../repos/paymentMethodRepo';

import { GetPaymentMethodsResponse as Response } from './GetPaymentMethodsResponse';
import type { GetPaymentMethodsDTO as DTO } from './GetPaymentMethodsDTO';
import * as Errors from './GetPaymentMethodsErrors';

type Context = UsecaseAuthorizationContext;

export class GetPaymentMethodsUseCase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(
    private paymentMethodRepo: PaymentMethodRepoContract,
    private loggerService: LoggerContract
  ) {
    super();
  }

  @Authorize('paymentMethods:read')
  public async execute(request?: DTO, context?: Context): Promise<Response> {
    try {
      this.loggerService.debug('GetPaymentMethodsUseCase', {
        request,
        context,
      });

      try {
        const paymentMethods = await this.paymentMethodRepo.getPaymentMethods();

        this.loggerService.debug('GetPaymentMethodsUseCase', {
          context,
          data: paymentMethods,
        });

        if (paymentMethods.isLeft()) {
          return left(
            new Errors.GetPaymentMethodsDbRequestError(
              new Error(paymentMethods.value.message)
            )
          );
        }

        return right(paymentMethods.value);
      } catch (err) {
        return left(new Errors.GetPaymentMethodsDbRequestError(err));
      }
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
