export interface RecordCreditCardPaymentDTO {
  foreignPaymentId?: string;
  paymentMethodId: string;
  invoiceId: string;
  datePaid?: string;
  payerId: string;
  amount: number;
}
