import { ExternalOrderId } from '../../../../../../domain/external-order-id';
import {
  BraintreeTransactionRequest,
  BraintreeServiceContract,
} from '../../../../../../domain/services/payment/braintree-service';

import { PayBehavior, PaymentDTO } from '../pay-behavior';

export class BraintreePayBehavior extends PayBehavior {
  constructor(private braintreeService: BraintreeServiceContract) {
    super();
  }

  async makePayment(request: PaymentDTO): Promise<ExternalOrderId> {
    const transactionData: BraintreeTransactionRequest = {
      invoiceReferenceNumber: request.invoiceReferenceNumber,
      paymentMethodNonce: request.payerIdentification,
      manuscriptCustomId: request.manuscriptCustomId,
      paymentTotal: request.invoiceTotal,
    };

    return this.braintreeService.createTransaction(transactionData);
  }
}
