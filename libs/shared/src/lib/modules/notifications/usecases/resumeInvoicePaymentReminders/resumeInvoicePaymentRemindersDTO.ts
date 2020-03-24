export interface ResumeInvoicePaymentRemindersDTO {
  reminderDelay: number;
  invoiceId: string;
  queueName: string;
  jobType: string;
}
