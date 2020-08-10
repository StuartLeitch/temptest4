import { StrategyError } from '../../../../../../core/logic/strategy-error';
import { Either } from '../../../../../../core/logic/Either';

import { BraintreeServiceContract } from '../../../../../../domain/services/payment/braintree-service';
import { PaymentClientToken } from '../../../../../../domain/PaymentClientToken';

import { ClientTokenBehavior } from './client-token-behavior';

export class BraintreeClientToken extends ClientTokenBehavior {
  constructor(private braintreeService: BraintreeServiceContract) {
    super();
  }

  async createClientToken(): Promise<
    Either<StrategyError, PaymentClientToken>
  > {
    return this.braintreeService.generateClientToken();
  }
}
