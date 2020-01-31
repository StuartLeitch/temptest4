export interface RecordCreditCardPaymentDTO {
  // foreignPaymentId?: string;
  paymentMethodNonce: string;
  merchantAccountId: string;
  paymentMethodId: string;
  invoiceId: string;
  datePaid?: string;
  payerId: string;
  amount: number;
}
