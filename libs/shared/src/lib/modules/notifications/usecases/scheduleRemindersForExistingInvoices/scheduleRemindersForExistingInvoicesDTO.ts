export interface ScheduleRemindersForExistingInvoicesDTO {
  confirmationQueueName: string;
  creditControlDelay: number;
  confirmationDelay: number;
  paymentQueueName: string;
  paymentDelay: number;
}
