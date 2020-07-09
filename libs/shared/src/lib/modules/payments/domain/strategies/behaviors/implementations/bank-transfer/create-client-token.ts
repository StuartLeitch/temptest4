import { StrategyError } from '../../../../../../../core/logic/strategy-error';
import { Either, right } from '../../../../../../../core/logic/Either';

import { PaymentClientToken } from '../../../../../../../domain/PaymentClientToken';

import { CreateClientTokenBehavior } from '../../create-client-token';

export class BankTransferCreateClientTokenBehavior extends CreateClientTokenBehavior {
  constructor() {
    super();
  }

  async createClientToken(): Promise<
    Either<StrategyError, PaymentClientToken>
  > {
    return right(null);
  }
}
