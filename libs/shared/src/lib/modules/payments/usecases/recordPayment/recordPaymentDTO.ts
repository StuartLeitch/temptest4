export interface RecordPaymentDTO {
  foreignPaymentId?: string;
  paymentMethodId: string;
  invoiceId: string;
  payerId: string;
  amount: number;
}
