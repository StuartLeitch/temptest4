export interface RemindersPauseState {
  confirmation: boolean;
  payment: boolean;
}

export interface ToggleConfirmationMutationResponse {
  togglePauseConfirmationReminders: RemindersPauseState;
}

export interface TogglePaymentMutationResponse {
  togglePausePaymentReminders: RemindersPauseState;
}

export interface SentReminder {
  forInvoice: string;
  toEmail: string;
  type: string;
  when: string;
}

export interface QueryRemindersState {
  remindersStatus: RemindersPauseState;
}

export interface QuerySentReminders {
  remindersSent: SentReminder[];
}

export type ToggleResponse =
  | ToggleConfirmationMutationResponse
  | TogglePaymentMutationResponse;
