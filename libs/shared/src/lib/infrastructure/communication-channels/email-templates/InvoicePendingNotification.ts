import { EmailContent } from '../EmailProps';

import { Invoice } from '../../../modules/invoices/domain/Invoice';

export class InvoicePendingNotificationTemplate {
  static build(invoice: Invoice): EmailContent {
    const subject = `[Sanctioned Country] An Invoice was confirmed from a Sanctioned Country`;
    const paragraph = `
      The invoice with id {${invoice.id.toString()}} and reference number
      {${invoice.referenceNumber}} has been confirmed from a Sanctioned Country.
    `;

    return {
      paragraph,
      subject
    };
  }
}
