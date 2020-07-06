export interface CreatePaymentDTO {
  foreignPaymentId: string;
  paymentMethodId: string;
  datePaid?: string;
  invoiceId: string;
  payerId: string;
  amount: number;
  status: string;
}
