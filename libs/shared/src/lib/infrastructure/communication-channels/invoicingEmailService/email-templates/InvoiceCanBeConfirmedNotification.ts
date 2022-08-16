import { EmailContent } from '../EmailProps';

import { Manuscript } from '../../../../modules/manuscripts/domain/Manuscript';
import { CatalogItem } from '../../../../modules/journals/domain/CatalogItem';
import { InvoiceItem } from '../../../../modules/invoices/domain/InvoiceItem';
import { Invoice } from '../../../../modules/invoices/domain/Invoice';

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
  static build(data: TemplateData): EmailContent {
    const {
      bankTransferCopyReceiverAddress,
      catalogItem,
      invoiceItem,
      invoiceLink,
      manuscript,
      publisherName,
      invoice,
    } = data;
    const subject = `${manuscript.customId}: Article Processing Charges`;
    const paragraph = `
    <h4>Thank you for choosing ${publisherName} to publish your manuscript</h4>
    We are pleased to inform you that your manuscript, ${manuscript.title}, has been accepted for publication in the journal, ${catalogItem.journalTitle}. We will be in touch shortly to request electronic files for your manuscript.
    <br/> <br/>
    The publication process will begin upon the receipt of these files.
    <br/> <br/>
    As an open access journal, ${catalogItem.journalTitle} has an associated Article Processing Charge. The total charges for your manuscript ${manuscript.customId}, before any taxes, are ${catalogItem.currency} ${invoiceItem.price}.
    <br/> <br/>
    VAT charges will be applied for individuals resident in the UK and for institutions registered in the UK. VAT is calculated at the applicable rate, currently 20%, on the net ${catalogItem.currency} amount and this VAT charge will be available for review on the invoice prior to confirmation.
    <br/> <br/>
    <h4>What to do next?</h4>
    This invoice is payable upon receipt. You can view the invoice for your article, confirm billing details, apply coupons and make payment through the following URL:
    <br /><br /><br />
    ${invoiceLink}
    <br />
    You do not need to log in to your account to access the link. After entering your billing address information, you will be able to pay by credit card, PayPal or bank transfer. We are unable to accept payment by check.
    <br /><br />
    If paying by <b>credit card</b>, we accept <b>Visa</b>, <b>Mastercard</b>, <b>Discover</b> and <b>Maestro</b>. If your credit card is not one of these then you may be able to use <b>PayPal</b> to make payment using your credit card.
    <br /><br />
    If paying by <b>bank transfer</b>, please use invoice number in the payment reference and return a scanned copy of the bank payment authorization by email to <a href="mailto:${bankTransferCopyReceiverAddress}">${bankTransferCopyReceiverAddress}</a> to help us track your payment. Please note that bank transfer payments can take up to a week to arrive and will be confirmed as soon as funds have cleared.
    <br /><br />
    If the payment needs to be made by your institution or by another author, you can forward them the invoice link in this email and they will be able to make payment directly. However, please note that as the author that submitted the article remains responsible for ensuring payment is made in full, you may be contacted if this institution or author does not make payment.
    <br/>
    <h4>Got a question?</h4>
    If you have any questions related to the invoice, just reply to this email and our Customer Service team will be happy to help.
    `;

    return {
      paragraph,
      subject,
    };
  }
}
