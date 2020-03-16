export interface SendInvoiceCreditControlReminderDTO {
  manuscriptCustomId: string;
  recipientEmail: string;
  recipientName: string;
  senderEmail: string;
  senderName: string;
  job: {
    queName: string;
    delay: number;
    type: string;
  };
}
