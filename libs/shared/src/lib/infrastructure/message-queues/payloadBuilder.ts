import { InvoiceReminderPayload } from './payloads';

export class PayloadBuilder {
  static invoiceReminder(
    manuscriptCustomId: string,
    email: string,
    firstName: string,
    lastName: string
  ): InvoiceReminderPayload {
    const name = lastName ? `${firstName} ${lastName}` : firstName;
    return {
      manuscriptCustomId: manuscriptCustomId,
      recipientEmail: email,
      recipientName: name
    };
  }
}
