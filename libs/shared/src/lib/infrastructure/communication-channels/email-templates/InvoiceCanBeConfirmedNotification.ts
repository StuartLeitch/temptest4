import { Manuscript } from '../../../modules/manuscripts/domain/Manuscript';
import { CatalogItem } from '../../../modules/journals/domain/CatalogItem';
import { InvoiceItem } from '../../../modules/invoices/domain/InvoiceItem';
import { Invoice } from '../../../modules/invoices/domain/Invoice';

interface TemplateData {
  invoiceItem: InvoiceItem;
  catalogItem: CatalogItem;
  manuscript: Manuscript;
  invoice: Invoice;
  bankTransferCopyReceiverAddress: string;
  publisherName: string;
  invoiceLink: string;
}

export class InvoiceCanBeConfirmedNotificationTemplate {
  static build(data: TemplateData) {
    const {
      bankTransferCopyReceiverAddress,
      catalogItem,
      invoiceItem,
      invoiceLink,
      manuscript,
      publisherName,
      invoice
    } = data;
    const subject = `${manuscript.customId}: Article Processing Charges`;
    const paragraph = `
    <h4>Thank you for choosing ${publisherName} to publish your manuscript</h4>
    As an open access journal, publication of articles in ${
      catalogItem.journalTitle
    } is associated with Article Processing Charges that amount to ${
      catalogItem.amount
    } ${catalogItem.currency}. The total charges for your manuscript ${
      manuscript.customId
    }, before any taxes, are ${invoiceItem.price} ${catalogItem.currency}.
    ${
      publisherName === 'Hindawi'
        ? `If you are required to pay United Kingdom Value Added Tax (VAT) as an individual or institution this will increase the overall cost of the charges by the prevailing rate of UK VAT at the date of the invoice.`
        : ''
    }
    <br/><h4>What to do next?</h4>
    In order to finalize the invoice with the correct billing details, you now access the invoice to confirm the details. Invoices can be charged to an individual or an institution depending on who is paying. This invoice is payable upon receipt. You can access the invoice for your article and make payment through the following URL:
    <br /><br />

    ${invoiceLink}

    You do not need to login to your account to access the link. After entering your billing address information, you will be able to pay directly by debit or credit, PayPal or bank transfer.
    We are unable to accept payment by cheque.
    <br /><br />
    If paying by debit or credit card, we accept Visa, Mastercard, Discover and Maestro. You may find there are other card options if using your card against payment through PayPal.
    <br /><br />
    If paying by bank transfer, please use invoice number <strong>${
      invoice.invoiceNumber
    }/${(
      invoice.dateAccepted || invoice.dateCreated
    ).getFullYear()}</strong> in the payment reference and return a scanned copy of the payment authorization by email to <a href="mailto:${bankTransferCopyReceiverAddress}">${bankTransferCopyReceiverAddress}</a> to facilitate our tracking of your payment and to avoid us unnecessarily chasing payment.
    <br /><br />
    Please note that bank transfer payments can take up to a week to arrive and will be confirmed as soon as funds have cleared.
    <br /><br />
    If the payment will be made by an alternative source such as your institution, you can provide them with the invoice link.
    <h4>Got a question?</h4>
    If you have any questions related to the invoice, just reply to this email and our Customer Service team will be happy to help.
    `;

    return {
      paragraph,
      subject
    };
  }
}
