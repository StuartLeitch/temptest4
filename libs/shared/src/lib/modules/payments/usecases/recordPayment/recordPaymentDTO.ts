export interface RecordPaymentDTO {
  payerIdentification?: string;
  paymentReference?: string;
  isFinalPayment?: boolean;
  invoiceId: string;
  datePaid: string;
  amount?: number;
}
