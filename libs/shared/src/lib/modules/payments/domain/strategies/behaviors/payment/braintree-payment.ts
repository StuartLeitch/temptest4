import { StrategyError } from '../../../../../../core/logic/strategy-error';
import { AsyncEither } from '../../../../../../core/logic/AsyncEither';
import { Either } from '../../../../../../core/logic/Either';

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

    return new AsyncEither(transactionData)
      .then((data) => this.braintreeService.createTransaction(data))
      .map((foreignPaymentId) => ({
        status: PaymentStatus.COMPLETED,
        foreignPaymentId,
      }))
      .execute();
  }
}
