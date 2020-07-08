export interface RecordPaymentDTO {
  payerIdentification?: string;
  paymentReference?: string;
  isFinalPayment?: boolean;
  datePayed?: string;
  invoiceId: string;
}
