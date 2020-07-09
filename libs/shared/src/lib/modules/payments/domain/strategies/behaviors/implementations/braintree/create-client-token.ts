import { StrategyError } from '../../../../../../../core/logic/strategy-error';
import { Either } from '../../../../../../../core/logic/Either';

import { BraintreeServiceContract } from '../../../../../../../domain/services/payment/braintree-service';
import { PaymentClientToken } from '../../../../../../../domain/PaymentClientToken';

import { CreateClientTokenBehavior } from '../../create-client-token';

export class BraintreeCreateClientTokenBehavior extends CreateClientTokenBehavior {
  constructor(private braintreeService: BraintreeServiceContract) {
    super();
  }

  async createClientToken(): Promise<
    Either<StrategyError, PaymentClientToken>
  > {
    return this.braintreeService.generateClientToken();
  }
}
