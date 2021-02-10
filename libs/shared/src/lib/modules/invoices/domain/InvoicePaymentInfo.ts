export interface InvoicePaymentInfo {
  invoiceId: string;
  transactionId: string;
  invoiceStatus: string;
  invoiceNumber: number;
  invoiceIssueDate: string;
  payerName: string;
  payerEmail: string;
  payerType: string;
  address: string;
  city: string;
  country: string;
  vatRegistrationNumber: string;
  foreignPaymentId: string;
  amount: number;
  paymentDate: string;
  paymentType: string;
}
