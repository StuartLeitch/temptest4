export interface SendInvoiceConfirmationReminderDTO {
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
