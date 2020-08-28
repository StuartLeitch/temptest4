export interface SendInvoiceCreditControlReminderDTO {
  notificationDisabled: boolean;
  creditControlDelay: number;
  recipientEmail: string;
  recipientName: string;
  paymentDelay: number;
  senderEmail: string;
  senderName: string;
  invoiceId: string;
}
