export interface SendInvoiceCreditControlReminderDTO {
  creditControlDelay: number;
  recipientEmail: string;
  recipientName: string;
  paymentDelay: number;
  senderEmail: string;
  senderName: string;
  invoiceId: string;
}
