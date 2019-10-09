export interface PaymentGateway {
  config?: any;
  clientToken?: any;
  paymentMethod?: any;
  paymentMethodNonce?: any;
  transaction: any;
  // submitTransaction(order, creditCard): Promise<unknown>;
  // voidTransaction(transactionId, options): Promise<unknown>;
  // refundTransaction(transactionId, options): Promise<unknown>;
}
