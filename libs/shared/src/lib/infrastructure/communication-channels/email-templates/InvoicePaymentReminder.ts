import { format, differenceInCalendarDays } from 'date-fns';

import { CatalogItem } from '../../../modules/journals/domain/CatalogItem';
import { Invoice } from '../../../modules/invoices/domain/Invoice';

export class InvoicePaymentFirstReminderTemplate {
  static build(
    manuscriptCustomId: string,
    catalogItem: CatalogItem,
    invoice: Invoice,
    invoiceButton: string,
    publisherName: string,
    publisherSite: string
  ) {
    const price = `${catalogItem.currency} ${invoice.getInvoiceTotal()}`;

    const subject = `${manuscriptCustomId}: Article Processing Charges`;
    const paragraph = `
      We wanted to drop you a quick note to remind you that the invoice for manuscript ${manuscriptCustomId} in the amount of ${price} is still due for payment.</br>
      </br>
      You can access the invoice for your article and make payment through the following URL:
      </br></br>
      ${invoiceButton}

      If you have any questions related to the invoice, just reply to this email and our Customer Service team will be able to help.
      </br></br></br>
      *************************************</br>
      Customer Service Team</br>
      ${publisherName}</br>
      ${publisherSite}</br>
      *************************************</br>
      This is an automated email - if you have already paid your invoice, please ignore this email whilst we update our records.
    `;

    return {
      paragraph,
      subject
    };
  }
}

export class InvoicePaymentSecondReminderTemplate {
  static build(
    manuscriptCustomId: string,
    catalogItem: CatalogItem,
    invoice: Invoice,
    invoiceButton: string,
    publisherName: string,
    publisherSite: string
  ) {
    const price = `${catalogItem.currency} ${invoice.getInvoiceTotal()}`;
    const issueDate = format(invoice.dateIssued, 'd MMMM yyyy');

    const subject = `${manuscriptCustomId}: Article Processing Charges`;
    const paragraph = `
      The invoice for manuscript ${manuscriptCustomId} in the amount of ${price} is still due for payment. This invoice was issued on ${issueDate}.<br/>
      </br>
      You can access the invoice for your article and make payment through the following URL:
      </br></br/>
      ${invoiceButton}

      If you need further assistance to make this payment, just reply to this email and our Customer Service team will be able to help.</br>
      </br>
      If you have already processed this payment, you can send us the receipt by email.</br>
      </br>
      Your swift cooperation would be appreciated.</br>
      </br>
      </br>
      *************************************</br>
      Customer Service Team</br>
      ${publisherName}</br>
      ${publisherSite}</br>
      *************************************</br>
      This is an automated email - if you have already paid your invoice, please ignore this email whilst we update our records.

    `;

    return {
      paragraph,
      subject
    };
  }
}

export class InvoicePaymentThirdReminderTemplate {
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

    const subject = `${manuscriptCustomId}: Article Processing Charges`;
    const paragraph = `
      The invoice for manuscript ${manuscriptCustomId} in the amount of ${price} is still due for payment.</br>
      </br>
      This invoice is now ${daysNo} days overdue. If payment is not received this invoice will be escalated to our Credit Control team so we urge you to make payment as a matter of urgency.</br>
      </br>
      You can access the invoice for your article and make payment through the following URL:</br>
      </br>
      ${invoiceButton}

      If you need further assistance before you can make this payment, please reply to this email as soon as possible and our Customer Service team will be able to help.</br>
      </br>
      *************************************</br>
      Customer Service Team</br>
      ${publisherName}</br>
      ${publisherSite}</br>
      *************************************</br>
      This is an automated email - if you have already paid your invoice, please ignore this email whilst we update our records.
    `;

    return {
      paragraph,
      subject
    };
  }
}

export class InvoicePaymentFourthReminderTemplate {
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
      I am writing to you with regard to the invoice for manuscript ${manuscriptCustomId} in the amount of ${price} which is still unpaid despite multiple requests for payment.</br>
      </br>
      As this invoice is now ${daysNo} days overdue it has been escalated to the Hindawi Credit Control team for resolution. Please contact me immediately to discuss the payment of this invoice.</br>
      </br>
      Alternatively, you can access the invoice for your article and make payment through the following URL:
      </br></br>
      ${invoiceButton}

      Please make the payment as a matter of urgency.</br>
      </br>
      Kind regards,</br>
      </br>
      ********************************</br>
      Accounts Receivable Team</br>
      Credit Control Specialist</br>
      ${publisherName}</br>
      ${publisherSite}</br>
      ********************************
    `;

    return {
      paragraph,
      subject
    };
  }
}
