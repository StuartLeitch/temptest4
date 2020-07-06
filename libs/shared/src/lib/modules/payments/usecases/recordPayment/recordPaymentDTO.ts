export interface RecordPaymentDTO {
  payerIdentification?: string;
  paymentReference?: string;
  datePayed?: string;
  invoiceId: string;
}
