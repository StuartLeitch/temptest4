import { StrategyError } from '../../../../../../core/logic/strategy-error';
import { Either, right } from '../../../../../../core/logic/Either';

import { PaymentProof } from '../../../payment-proof';

import { CaptureMoneyBehavior } from './capture-money-behavior';

export class EmptyCaptureMoney extends CaptureMoneyBehavior {
  constructor() {
    super();
  }

  async captureMoney(): Promise<Either<StrategyError, PaymentProof>> {
    return right(null);
  }
}
