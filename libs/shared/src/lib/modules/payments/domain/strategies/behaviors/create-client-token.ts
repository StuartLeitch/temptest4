import { StrategyError } from '../../../../../core/logic/strategy-error';
import { Behavior } from '../../../../../core/logic/strategy';
import { Either } from '../../../../../core/logic/Either';

import { PaymentClientToken } from '../../../../../domain/PaymentClientToken';

export abstract class CreateClientTokenBehavior implements Behavior {
  readonly type = Symbol.for('@CreateClientTokenBehavior');

  abstract createClientToken(): Promise<
    Either<StrategyError, PaymentClientToken>
  >;
}
