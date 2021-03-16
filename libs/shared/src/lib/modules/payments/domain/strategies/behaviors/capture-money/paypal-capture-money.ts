import { StrategyError } from '../../../../../../core/logic/strategy-error';
import { Either, right, left } from '../../../../../../core/logic/Either';

import { PayPalServiceContract } from '../../../../../../domain/services/payment/paypal-service';

import { ExternalOrderId } from '../../../external-order-id';

import {
  CaptureMoneyBehavior,
  CaptureMoneyDTO,
} from './capture-money-behavior';

class UnsuccessfulOrderCapture extends StrategyError {
  constructor(message: string) {
    super(message, 'Paypal.captureMoney');
  }
}

export class PayPalCaptureMoney extends CaptureMoneyBehavior {
  constructor(private paypalService: PayPalServiceContract) {
    super();
  }

  async captureMoney(
    request: CaptureMoneyDTO
  ): Promise<Either<StrategyError, ExternalOrderId>> {
    const response = await this.paypalService.captureMoney(request.orderId);

    if (response.isLeft()) {
      return left(new UnsuccessfulOrderCapture(response.value.message));
    } else {
      return right(response.value);
    }
  }
}
