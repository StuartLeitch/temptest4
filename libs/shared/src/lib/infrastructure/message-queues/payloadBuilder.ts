import { InvoiceReminderPayload } from './payloads';

export class PayloadBuilder {
  static invoiceReminder(
    manuscriptCustomId: string,
    email: string,
    firstName: string,
    lastName: string
  ): InvoiceReminderPayload {
    return {
      manuscriptCustomId: manuscriptCustomId,
      recipientEmail: email,
      recipientName: `${firstName} ${lastName}`
    };
  }
}
