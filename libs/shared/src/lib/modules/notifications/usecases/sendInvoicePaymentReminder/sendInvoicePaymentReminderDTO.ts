export interface SendInvoicePaymentReminderDTO {
  recipientEmail: string;
  recipientName: string;
  senderEmail: string;
  senderName: string;
  invoiceId: string;
  job: {
    queueName: string;
    delay: number;
  };
}
