export interface SendInvoiceConfirmationReminderDTO {
  manuscriptCustomId: string;
  recipientEmail: string;
  recipientName: string;
  senderEmail: string;
  senderName: string;
  invoiceId: string;
}
