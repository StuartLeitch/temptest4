import { StrategyError } from '../../../../../../core/logic/strategy-error';
import { Either, right } from '../../../../../../core/logic/Either';

import { PaymentClientToken } from '../../../../../../domain/PaymentClientToken';

import { ClientTokenBehavior } from './client-token-behavior';

export class EmptyClientToken extends ClientTokenBehavior {
  constructor() {
    super();
  }

  async createClientToken(): Promise<
    Either<StrategyError, PaymentClientToken>
  > {
    return right(null);
  }
}
