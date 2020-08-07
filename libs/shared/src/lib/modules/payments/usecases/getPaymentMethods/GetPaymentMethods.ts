/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { PaymentMethodRepoContract } from '../../repos/paymentMethodRepo';

import { GetPaymentMethodsResponse as Response } from './GetPaymentMethodsResponse';
import { GetPaymentMethodsDTO as DTO } from './GetPaymentMethodsDTO';
import * as Errors from './GetPaymentMethodsErrors';

export class GetPaymentMethodsUseCase
  implements
    UseCase<DTO, Promise<Response>>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private paymentMethodRepo: PaymentMethodRepoContract,
    private loggerService: LoggerContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request?: any, context?: any): Promise<Response> {
    try {
      // (this.paymentMethodRepo as any).correlationId = context.correlationId;

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

        return right(Result.ok(paymentMethods));
      } catch (err) {
        return left(new Errors.GetPaymentMethodsDbRequestError(err));
      }
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
