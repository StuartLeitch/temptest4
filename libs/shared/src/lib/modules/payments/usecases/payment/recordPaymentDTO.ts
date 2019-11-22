export interface RecordPaymentDTO {
  payerId: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  foreignPaymentId: string;
}
