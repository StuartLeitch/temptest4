// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
} from '../../../../domain/authorization/decorators/Authorize';

// * Usecase specific
import { BraintreeGateway } from './../../infrastructure/gateways/braintree/gateway';
import { Braintree } from './../../domain/strategies/Braintree';
import { BraintreePayment } from '../../domain/strategies/BrainTreePayment';
import { PaymentFactory } from './../../domain/strategies/PaymentFactory';
// import { PaymentModel } from './../../domain/contracts/PaymentModel';
import { PaymentStrategy } from './../../domain/strategies/PaymentStrategy';
import { PaymentClientToken } from './../../../../domain/PaymentClientToken';

import { GenerateClientTokenResponse } from './generateClientTokenResponse';
import { GenerateClientTokenErrors } from './generateClientTokenErrors';

export type GenerateClientTokenContext = AuthorizationContext<Roles>;

export class GenerateClientTokenUsecase
  implements
    UseCase<
      {},
      Promise<GenerateClientTokenResponse>,
      GenerateClientTokenContext
    >,
    AccessControlledUsecase<
      {},
      GenerateClientTokenContext,
      AccessControlContext
    > {
  constructor() {}

  public async execute(
    request: { merchantAccountId: string },
    context?: GenerateClientTokenContext
  ): Promise<GenerateClientTokenResponse> {
    const braintree = new Braintree();
    const paymentFactory = new PaymentFactory();
    paymentFactory.registerPayment(braintree);
    const braintreePayment = new BraintreePayment(BraintreeGateway);

    try {
      const tokenGenerated: any = await braintreePayment.generateClientToken(
        request.merchantAccountId
      );

      if (tokenGenerated.isFailure) {
        return left(new GenerateClientTokenErrors.ClientTokenNotGenerated());
      }

      const token = tokenGenerated.getValue();

      return right(Result.ok<PaymentClientToken>(token));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
