export interface RecordBankTransferPaymentDTO {
  invoiceId: string;
  payerId: string;
  paymentMethodId: string;
  paymentReference: string;
  amount: number;
  datePaid?: string;
  markInvoiceAsPaid?: boolean;
}
