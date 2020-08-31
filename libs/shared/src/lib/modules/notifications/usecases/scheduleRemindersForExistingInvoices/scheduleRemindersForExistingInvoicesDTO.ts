export interface ScheduleRemindersForExistingInvoicesDTO {
  creditControlDisabled: boolean;
  confirmationQueueName: string;
  creditControlDelay: number;
  confirmationDelay: number;
  paymentQueueName: string;
  paymentDelay: number;
}
