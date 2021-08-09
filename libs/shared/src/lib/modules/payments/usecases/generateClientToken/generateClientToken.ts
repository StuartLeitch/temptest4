// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';
import { left } from '../../../../core/logic/Either';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

// * Usecase specific
import {
  PaymentStrategySelection,
  PaymentStrategyFactory,
} from '../../domain/strategies/payment-strategy-factory';

import { GenerateClientTokenResponse as Response } from './generateClientToken.response';
import type { GenerateClientTokenDTO as DTO } from './generateClientToken.dto';

export class GenerateClientTokenUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private strategyFactory: PaymentStrategyFactory) {
    super();
  }

  @Authorize('payment:generateToken')
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
