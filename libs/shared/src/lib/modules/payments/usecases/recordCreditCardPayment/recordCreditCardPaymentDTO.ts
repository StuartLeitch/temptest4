export interface RecordCreditCardPaymentDTO {
  // foreignPaymentId?: string;
  paymentMethodNonce: string;
  paymentMethodId: string;
  merchantId: string;
  invoiceId: string;
  datePaid?: string;
  payerId: string;
  amount: number;
}
