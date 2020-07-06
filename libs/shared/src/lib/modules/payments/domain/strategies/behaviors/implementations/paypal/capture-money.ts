import { StrategyError } from '../../../../../../../core/logic/strategy-error';
import { Either } from '../../../../../../../core/logic/Either';

import { PayPalServiceContract } from '../../../../../../../domain/services/payment/paypal-service';

import { PaymentProof } from '../../../../payment-proof';

import {
  CaptureMoneyBehavior,
  CaptureMoneyDTO,
} from '../../capture-money-behavior';

export class PayPalCaptureMoneyBehavior extends CaptureMoneyBehavior {
  constructor(private paypalService: PayPalServiceContract) {
    super();
  }

  async captureMoney(
    request: CaptureMoneyDTO
  ): Promise<Either<StrategyError, PaymentProof>> {
    return this.paypalService.captureMoney(request.orderId) as any;
  }
}
