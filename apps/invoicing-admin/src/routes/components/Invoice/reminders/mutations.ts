export const TOGGLE_CONFIRMATION = `
  mutation togglePauseConfirmationReminders($id: ID!, $state: Boolean!) {
    togglePauseConfirmationReminders(invoiceId: $id, state: $state) {
      confirmation
      payment
    }
  }
`;
export const TOGGLE_PAYMENT = `
  mutation togglePausePaymentReminders($id: ID!, $state: Boolean!) {
    togglePausePaymentReminders(invoiceId: $id, state: $state) {
      confirmation
      payment
    }
  }
`;
