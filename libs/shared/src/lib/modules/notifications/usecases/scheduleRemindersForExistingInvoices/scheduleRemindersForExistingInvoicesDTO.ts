export interface ScheduleRemindersForExistingInvoicesDTO {
  confirmationQueueName: string;
  confirmationJobType: string;
  creditControlDelay: number;
  confirmationDelay: number;
  paymentQueueName: string;
  paymentJobType: string;
  paymentDelay: number;
}
