import { InvoiceReminderPayload } from './payloads';

export class PayloadBuilder {
  static invoiceReminder(
    invoiceId: string,
    email: string,
    firstName: string,
    lastName: string
  ): InvoiceReminderPayload {
    const name = lastName ? `${firstName} ${lastName}` : firstName;
    return {
      recipientEmail: email,
      invoiceId: invoiceId,
      recipientName: name,
    };
  }
}
