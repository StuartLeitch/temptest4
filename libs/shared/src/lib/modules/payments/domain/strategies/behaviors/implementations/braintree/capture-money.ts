import { StrategyError } from '../../../../../../../core/logic/strategy-error';
import { Either, right } from '../../../../../../../core/logic/Either';

import { BraintreeServiceContract } from '../../../../../../../domain/services/payment/braintree-service';

import { PaymentProof } from '../../../../payment-proof';

import { CaptureMoneyBehavior } from '../../capture-money-behavior';

export class BraintreeCaptureMoneyBehavior extends CaptureMoneyBehavior {
  constructor(private braintreeService: BraintreeServiceContract) {
    super();
  }

  async captureMoney(): Promise<Either<StrategyError, PaymentProof>> {
    return right(null);
  }
}
