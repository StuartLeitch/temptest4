import { StrategyError } from '../../../../../../core/logic/strategy-error';
import { Either, left } from '../../../../../../core/logic/Either';

import { BraintreeServiceContract } from '../../../../../../domain/services/payment/braintree-service';
import { PaymentClientToken } from '../../../../../../domain/PaymentClientToken';

import { ClientTokenBehavior } from './client-token-behavior';

export class BraintreeClientTokenError extends StrategyError {
  constructor(msg: string) {
    super(msg, 'Braintree.generateClientToken');
  }
}

export class BraintreeClientToken extends ClientTokenBehavior {
  constructor(private braintreeService: BraintreeServiceContract) {
    super();
  }

  async createClientToken(): Promise<
    Either<BraintreeClientTokenError, PaymentClientToken>
  > {
    const maybeResult = await this.braintreeService.generateClientToken();

    if (maybeResult.isLeft()) {
      return left(new BraintreeClientTokenError(maybeResult.value.toString()));
    }

    return maybeResult;
  }
}
