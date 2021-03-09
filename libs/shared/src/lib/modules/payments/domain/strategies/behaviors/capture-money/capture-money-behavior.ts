import { StrategyError } from '../../../../../../core/logic/strategy-error';
import { Behavior } from '../../../../../../core/logic/strategy';
import { Either } from '../../../../../../core/logic/Either';

import { ExternalOrderId } from '../../../external-order-id';

export interface CaptureMoneyDTO {
  orderId: string;
}

export abstract class CaptureMoneyBehavior implements Behavior {
  readonly type = Symbol.for('@CaptureMoneyBehavior');

  abstract captureMoney(
    request: CaptureMoneyDTO
  ): Promise<Either<StrategyError, ExternalOrderId>>;
}
