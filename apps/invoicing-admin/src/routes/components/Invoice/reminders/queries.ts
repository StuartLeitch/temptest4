export const SENT_REMINDERS = `
  query getSentReminders($id: ID!) {
    remindersSent(invoiceId: $id) {
      forInvoice
      toEmail
      when
      type
    }
  }
`;
export const REMINDERS_STATUS = `
  query remindersStatus($id: ID!) {
    remindersStatus(invoiceId: $id) {
      confirmation
      payment
    }
  }
`;
