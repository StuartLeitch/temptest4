import { StrategyError } from '../../../../../../core/logic/strategy-error';
import { AsyncEither } from '../../../../../../core/logic/AsyncEither';
import { Either, left } from '../../../../../../core/logic/Either';

import {
  PayPalServiceContract,
  PayPalOrderRequest,
} from '../../../../../../domain/services/payment/paypal-service';

import { PaymentStatus } from '../../../Payment';

import {
  PaymentBehavior,
  PaymentResponse,
  PaymentDTO,
} from './payment-behavior';

export class PayPalPaymentError extends StrategyError {
  constructor(msg: string) {
    super(msg, 'PayPal.createPayment');
  }
}

export class PayPalPayment extends PaymentBehavior {
  constructor(private paypalService: PayPalServiceContract) {
    super();
  }

  async makePayment(
    request: PaymentDTO
  ): Promise<Either<PayPalPaymentError, PaymentResponse>> {
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

    const maybeResult = await new AsyncEither(transactionData)
      .then((data) => this.paypalService.createOrder(data))
      .map((foreignPaymentId) => ({
        status: PaymentStatus.CREATED,
        foreignPaymentId,
      }))
      .execute();

    if (maybeResult.isLeft()) {
      return left(new PayPalPaymentError(maybeResult.value.toString()));
    }

    return maybeResult;
  }
}
