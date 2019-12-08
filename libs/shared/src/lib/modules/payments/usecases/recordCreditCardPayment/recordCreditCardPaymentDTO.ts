export interface RecordCreditCardPaymentDTO {
  // foreignPaymentId?: string;
  paymentMethodId: string;
  paymentMethodNonce: string;
  invoiceId: string;
  datePaid?: string;
  payerId: string;
  amount: number;
}
