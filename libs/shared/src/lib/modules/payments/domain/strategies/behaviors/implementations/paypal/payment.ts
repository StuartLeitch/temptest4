import { StrategyError } from '../../../../../../../core/logic/strategy-error';
import { AsyncEither } from '../../../../../../../core/logic/AsyncEither';
import { Either } from '../../../../../../../core/logic/Either';

import {
  PayPalServiceContract,
  PayPalOrderRequest,
} from '../../../../../../../domain/services/payment/paypal-service';

import { PaymentStatus } from '../../../../Payment';

import {
  PaymentBehavior,
  PaymentResponse,
  PaymentDTO,
} from '../../payment-behavior';

export class PayPalPaymentBehavior extends PaymentBehavior {
  constructor(private paypalService: PayPalServiceContract) {
    super();
  }

  async makePayment(
    request: PaymentDTO
  ): Promise<Either<StrategyError, PaymentResponse>> {
    const transactionData: PayPalOrderRequest = {
      netAmountBeforeDiscount: request.netAmountBeforeDiscount,
      invoiceReferenceNumber: request.invoiceReferenceNumber,
      manuscriptCustomId: request.manuscriptCustomId,
      discountAmount: request.discountAmount,
      paymentTotal: request.invoiceTotal,
      invoiceId: request.invoiceId,
      netAmount: request.netAmount,
      vatAmount: request.vatAmount,
    };

    return new AsyncEither(transactionData)
      .then((data) => this.paypalService.createOrder(data))
      .map((foreignPaymentId) => ({
        status: PaymentStatus.CREATED,
        foreignPaymentId,
      }))
      .execute();
  }
}
