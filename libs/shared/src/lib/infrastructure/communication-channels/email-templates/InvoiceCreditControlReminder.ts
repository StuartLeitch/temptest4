import { format, differenceInCalendarDays } from 'date-fns';

import { CatalogItem } from '../../../modules/journals/domain/CatalogItem';
import { Invoice } from '../../../modules/invoices/domain/Invoice';

export class InvoiceCreditControlReminderTemplate {
  static build(
    manuscriptCustomId: string,
    catalogItem: CatalogItem,
    invoice: Invoice,
    invoiceButton: string,
    publisherName: string,
    publisherSite: string
  ) {
    const price = `${catalogItem.currency} ${invoice.getInvoiceTotal()}`;
    const daysNo = differenceInCalendarDays(new Date(), invoice.dateIssued);

    const subject = `${manuscriptCustomId}: Article Processing Charges OVERDUE`;
    const paragraph = `
      I am writing to you with regard to the invoice for manuscript ${manuscriptCustomId} in the amount of ${price} which is still unpaid despite multiple requests for payment.<br/>
      <br/>
      As this invoice is now ${daysNo} days overdue it has been escalated to the Hindawi Credit Control team for resolution. Please contact me immediately to discuss the payment of this invoice.<br/>
      <br/>
      Alternatively, you can access the invoice for your article and make payment through the following URL:
      <br/><br/>
      ${invoiceButton}

      Please make the payment as a matter of urgency.<br/>
      <br/>
      Kind regards,<br/>
      <br/>
      ********************************<br/>
      Accounts Receivable Team<br/>
      Credit Control Specialist<br/>
      ${publisherName}<br/>
      ${publisherSite}<br/>
      ********************************
    `;

    return {
      paragraph,
      subject
    };
  }
}
