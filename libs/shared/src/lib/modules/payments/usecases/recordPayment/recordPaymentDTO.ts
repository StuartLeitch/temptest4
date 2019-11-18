export interface RecordPaymentDTO {
  foreignPaymentId: string;
  paymentMethod: string;
  invoiceId: string;
  payerId: string;
  amount: number;
}
