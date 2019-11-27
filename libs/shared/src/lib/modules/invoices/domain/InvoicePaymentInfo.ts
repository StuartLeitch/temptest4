export interface InvoicePaymentInfo {
  invoiceId: string;
  transactionId: string;
  invoiceStatus: string;
  invoiceNumber: string;
  invoiceIssueDate: string;
  payerEmail: string;
  payerType: string;
  address: string;
  city: string;
  country: string;
  foreignPaymentId: string;
  amount: number;
  paymentDate: string;
  paymentType: string;
}
