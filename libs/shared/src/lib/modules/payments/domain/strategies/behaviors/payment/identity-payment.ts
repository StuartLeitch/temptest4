import { StrategyError } from '../../../../../../core/logic/strategy-error';
import { Either, right } from '../../../../../../core/logic/Either';

import { ExternalOrderId } from '../../../external-order-id';
import { PaymentStatus } from '../../../Payment';

import {
  PaymentBehavior,
  PaymentResponse,
  PaymentDTO,
} from './payment-behavior';

export class IdentityPayment extends PaymentBehavior {
  constructor() {
    super();
  }

  async makePayment(
    request: PaymentDTO
  ): Promise<Either<StrategyError, PaymentResponse>> {
    return right({
      foreignPaymentId: ExternalOrderId.create(request.paymentReference),
      status: PaymentStatus.COMPLETED,
    });
  }
}
