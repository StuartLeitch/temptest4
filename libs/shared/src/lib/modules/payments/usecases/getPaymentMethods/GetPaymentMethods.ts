// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize,
} from '../../../../domain/authorization/decorators/Authorize';

import { PaymentMethodRepoContract } from '../../repos/paymentMethodRepo';

import { GetPaymentMethodsResponse as Response } from './GetPaymentMethodsResponse';
import { GetPaymentMethodsDTO as DTO } from './GetPaymentMethodsDTO';
import * as Errors from './GetPaymentMethodsErrors';

type Context = AuthorizationContext<Roles>;
export type GetPaymentMethodsContext = Context;

export class GetPaymentMethodsUseCase
  implements
    UseCase<DTO, Promise<Response>>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
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
      (this.paymentMethodRepo as any).correlationId = context.correlationId;

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
