/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';
import { left } from '../../../../core/logic/Either';

// * Authorization Logic
import {
  UsecaseAuthorizationContext as Context,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

// * Usecase specific
import {
  PaymentStrategySelection,
  PaymentStrategyFactory,
} from '../../domain/strategies/payment-strategy-factory';

import { GenerateClientTokenResponse as Response } from './generateClientToken.response';
import { GenerateClientTokenDTO as DTO } from './generateClientToken.dto';

export class GenerateClientTokenUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private strategyFactory: PaymentStrategyFactory) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    const strategy = await this.strategyFactory.getStrategy(
      PaymentStrategySelection.Braintree
    );

    try {
      const result = await strategy.createClientToken();
      return result;
    } catch (e) {
      return left(
        new UnexpectedError(
          e,
          'While generating the braintree client token error ocurred'
        )
      );
    }
  }
}
