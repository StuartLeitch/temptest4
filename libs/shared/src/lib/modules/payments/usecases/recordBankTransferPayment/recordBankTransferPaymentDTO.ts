export interface RecordBankTransferPaymentDTO {
  invoiceId: string;
  paymentMethodId: string;
  paymentReference: string;
  amount: number;
  datePaid?: string;
}
