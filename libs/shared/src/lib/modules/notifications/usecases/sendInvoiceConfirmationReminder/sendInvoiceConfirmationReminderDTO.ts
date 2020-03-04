export interface SendInvoiceConfirmationReminderDTO {
  manuscriptCustomId: string;
  recipientEmail: string;
  recipientName: string;
  senderEmail: string;
  senderName: string;
  invoiceId: string;
  job: {
    queName: string;
    delay: number;
    type: string;
  };
}
