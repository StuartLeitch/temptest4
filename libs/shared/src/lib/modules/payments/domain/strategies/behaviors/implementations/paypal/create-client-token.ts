import { StrategyError } from '../../../../../../../core/logic/strategy-error';
import { Either, right } from '../../../../../../../core/logic/Either';

import { PayPalServiceContract } from '../../../../../../../domain/services/payment/paypal-service';
import { PaymentClientToken } from '../../../../../../../domain/PaymentClientToken';

import { CreateClientTokenBehavior } from '../../create-client-token';

export class PayPalCreateClientTokenBehavior extends CreateClientTokenBehavior {
  constructor(private paypalService: PayPalServiceContract) {
    super();
  }

  async createClientToken(): Promise<
    Either<StrategyError, PaymentClientToken>
  > {
    return right(null);
  }
}
