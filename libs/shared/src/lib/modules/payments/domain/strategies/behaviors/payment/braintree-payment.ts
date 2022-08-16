import { StrategyError } from '../../../../../../core/logic/strategy-error';
import { Either, right, left } from '../../../../../../core/logic/Either';

import {
  BraintreeTransactionRequest,
  BraintreeServiceContract,
} from '../../../../../../domain/services/payment/braintree-service';

import { PaymentStatus } from '../../../Payment';

import {
  PaymentBehavior,
  PaymentResponse,
  PaymentDTO,
} from './payment-behavior';

export class BraintreePayment extends PaymentBehavior {
  constructor(private braintreeService: BraintreeServiceContract) {
    super();
  }

  async makePayment(
    request: PaymentDTO
  ): Promise<Either<StrategyError, PaymentResponse>> {
    const transactionData: BraintreeTransactionRequest = {
      invoiceReferenceNumber: request.invoiceReferenceNumber,
      paymentMethodNonce: request.payerIdentification,
      manuscriptCustomId: request.manuscriptCustomId,
      paymentTotal: request.invoiceTotal,
    };

    let result = await this.braintreeService.createTransaction(transactionData);

    if (result.isLeft()) {
      return left({
        message: result.value.message,
        behavior: result.value.originatingService,
      });
    }

    return right({
      status: PaymentStatus.COMPLETED,
      foreignPaymentId: result.value.externalOrderId,
      authorizationCode: result.value.authorizationCode,
      cardLastDigits: result.value.cardLastDigits,
    });
  }
}
