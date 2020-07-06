export interface CreatePaymentDTO {
  foreignPaymentId: string;
  paymentMethodId: string;
  invoiceId: string;
  payerId: string;
  datePaid?: Date;
  amount: number;
  status: string;
}
