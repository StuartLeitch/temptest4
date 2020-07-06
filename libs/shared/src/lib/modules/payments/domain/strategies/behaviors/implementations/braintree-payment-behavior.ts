import { StrategyError } from '../../../../../../core/logic/strategy-error';
import { Either } from '../../../../../../core/logic/Either';

import { ExternalOrderId } from '../../../../../../domain/external-order-id';
import {
  BraintreeTransactionRequest,
  BraintreeServiceContract,
} from '../../../../../../domain/services/payment/braintree-service';

import { PaymentBehavior, PaymentDTO } from '../payment-behavior';

export class BraintreePaymentBehavior extends PaymentBehavior {
  constructor(private braintreeService: BraintreeServiceContract) {
    super();
  }

  async makePayment(
    request: PaymentDTO
  ): Promise<Either<StrategyError, ExternalOrderId>> {
    const transactionData: BraintreeTransactionRequest = {
      invoiceReferenceNumber: request.invoiceReferenceNumber,
      paymentMethodNonce: request.payerIdentification,
      manuscriptCustomId: request.manuscriptCustomId,
      paymentTotal: request.invoiceTotal,
    };

    return this.braintreeService.createTransaction(transactionData);
  }
}
