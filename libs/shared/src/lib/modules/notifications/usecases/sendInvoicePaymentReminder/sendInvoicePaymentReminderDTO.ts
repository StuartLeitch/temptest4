export interface SendInvoicePaymentReminderDTO {
  manuscriptCustomId: string;
  recipientEmail: string;
  recipientName: string;
  senderEmail: string;
  senderName: string;
  job: {
    queueName: string;
    delay: string;
    type: string;
  };
}
