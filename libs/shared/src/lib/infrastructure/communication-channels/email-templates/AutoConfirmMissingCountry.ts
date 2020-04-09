import { EmailContent } from '../EmailProps';

export class AutoConfirmMissingCountryNotificationTemplate {
  static build(manuscriptCustomId: string, invoiceLink: string): EmailContent {
    const subject = `[Auto-Confirm Invoice] Country not available when auto-confirming published article`;
    const paragraph = `
      Hello,

      The country is not available for the corresponding author of the manuscript having custom Id {${manuscriptCustomId}}.
      Please confirm manually the invoice using this link {${invoiceLink}}.
    `;

    return {
      paragraph,
      subject
    };
  }
}
