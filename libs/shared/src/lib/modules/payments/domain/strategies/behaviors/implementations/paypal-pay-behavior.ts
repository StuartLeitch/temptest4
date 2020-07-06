import { ExternalOrderId } from '../../../../../../domain/external-order-id';
import {
  PayPalServiceContract,
  PayPalOrderRequest,
} from '../../../../../../domain/services/payment/paypal-service';

import { PayBehavior, PaymentDTO } from '../pay-behavior';

export class PayPalPayBehavior extends PayBehavior {
  constructor(private paypalService: PayPalServiceContract) {
    super();
  }

  async makePayment(request: PaymentDTO): Promise<ExternalOrderId> {
    const transactionData: PayPalOrderRequest = {
      invoiceReferenceNumber: request.invoiceReferenceNumber,
      manuscriptCustomId: request.manuscriptCustomId,
      paymentTotal: request.invoiceTotal,
    };

    return this.paypalService.createOrder(transactionData);
  }
}
