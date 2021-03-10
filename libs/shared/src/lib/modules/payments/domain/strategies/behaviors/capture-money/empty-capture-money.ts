import { StrategyError } from '../../../../../../core/logic/strategy-error';
import { Either, right } from '../../../../../../core/logic/Either';

import { ExternalOrderId } from '../../../external-order-id';

import { CaptureMoneyBehavior } from './capture-money-behavior';

export class EmptyCaptureMoney extends CaptureMoneyBehavior {
  constructor() {
    super();
  }

  async captureMoney(): Promise<Either<StrategyError, ExternalOrderId>> {
    return right(null);
  }
}
