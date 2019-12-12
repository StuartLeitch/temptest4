import EmailTemplate from '@pubsweet/component-email-templating';

import { Manuscript } from '../../modules/manuscripts/domain/Manuscript';
import { CatalogItem } from '../../modules/journals/domain/CatalogItem';
import { InvoiceItem } from '../../modules/invoices/domain/InvoiceItem';
import { Invoice } from '../../modules/invoices/domain/Invoice';

interface TemplateProps {
  type: string;
  fromEmail: string;
  toUser: {
    email: string;
    name?: string;
  };
  content: {
    ctaText?: string;
    signatureJournal?: string;
    signatureName?: string;
    subject: string;
    paragraph: string;
    ctaLink?: string;
    footerText?: string;
  };
  bodyProps: {
    hasLink: boolean;
    hasIntro: boolean;
    hasSignature: boolean;
  };
}

class EmailService {
  private email: any;

  static createURL(path: string) {
    return `${process.env.FE_ROOT}${path}`;
  }

  static createSingleButton(label: string, link: string) {
    return `
    <table border="0" cellPadding="0" cellSpacing="0" class="module" data-role="module-button" data-type="button" role="module"
      style="table-layout:fixed" width="100%">
      <tbody>
        <tr>
          <td align="center" bgcolor="#FFFFFF" class="outer-td" style="padding:0px 0px 30px 0px;background-color:#FFFFFF">
            <table border="0" cellPadding="0" cellSpacing="0" class="button-css__deep-table___2OZyb wrapper-mobile" style="text-align:center">
              <tbody>
                <tr>
                  <td align="center" bgcolor="{{ctaColor}}" class="inner-td" style="border-radius:6px;font-size:16px;text-align:center;background-color:inherit">
                    <a href="${link}" style="background-color:{{ctaColor}};border:1px solid #333333;border-color:{{ctaColor}};border-radius:0px;border-width:1px;color:#ffffff;display:inline-block;font-family:arial,helvetica,sans-serif;font-size:16px;font-weight:normal;letter-spacing:0px;line-height:16px;padding:12px 18px 12px 18px;text-align:center;text-decoration:none"
                      target="_blank">${label}</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    `;
  }

  public createTemplate(templateProps: TemplateProps): EmailService {
    this.email = new EmailTemplate(templateProps);
    return this;
  }

  public sendEmail() {
    if (process.env.MAILING_DISABLED === 'false') {
      return this.email.sendEmail();
    }
  }

  public createInvoicePendingNotification(
    invoice: Invoice,
    receiverEmail: string,
    senderEmail: string
  ) {
    return this.createTemplate({
      type: 'user',
      fromEmail: senderEmail,
      toUser: {
        email: receiverEmail
      },
      content: {
        subject: `[Sanctioned Country] An Invoice was confirmed from a Sanctioned Country`,
        paragraph: `
          The invoice with id {${invoice.id.toString()}} and reference number {${
          invoice.invoiceNumber
        }/${invoice.dateAccepted.getFullYear()}} has been confirmed from a Sanctioned Country.
        `
      },
      bodyProps: {
        hasLink: false,
        hasIntro: true,
        hasSignature: false
      }
    });
  }

  // TODO: move templates to a different place?
  public createInvoicePaymentTemplate(
    manuscript: Manuscript,
    catalogItem: CatalogItem,
    invoiceItem: InvoiceItem,
    invoice: Invoice
  ) {
    return this.createTemplate({
      type: 'user',
      fromEmail: 'Hindawi Invoicing <invoices@hindawi.com>',
      toUser: {
        email: manuscript.authorEmail,
        name: `${manuscript.authorFirstName} ${manuscript.authorSurname}`
      },
      content: {
        subject: `${manuscript.customId}: Article Processing Charges`,
        paragraph: `
        <h4>Thank you for choosing Hindawi to publish your manuscript</h4>
        As an open access journal, publication of articles in ${
          catalogItem.journalTitle
        } is associated with Article Processing Charges that amount to ${
          catalogItem.amount
        } ${catalogItem.currency}. The total charges for your manuscript ${
          manuscript.customId
        }, before any taxes, are ${invoiceItem.price} ${
          catalogItem.currency
        }. If you are required to pay Value Added Tax (VAT) as an individual or institution this will increase the overall cost of the charges.
        <br/><h4>What to do next?</h4>
        This invoice is payable upon receipt. You can access the invoice for your article and make payment through the following URL:
        <br /><br />
        ${EmailService.createSingleButton(
          'INVOICE DETAILS',
          EmailService.createURL(
            `/payment-details/${invoiceItem.invoiceId.id.toString()}`
          )
        )}
        You do not need to login to your account to access the link. After entering your billing address information, you will be able to pay by direct credit card, PayPal or bank transfer.
        We are unable to accept payment by check.
        <br /><br />
        If paying by credit card, we accept Visa, Mastercard, Discover and Maestro.
        <br /><br />
        If paying by bank transfer, please use invoice number <strong>${
          invoice.invoiceNumber
        }/${(
          invoice.dateAccepted || invoice.dateCreated
        ).getFullYear()}</strong> in the payment reference and return a scanned copy of the payment authorisation by email to facilitate our tracking of your payment.
        <br /><br />
        Please note that bank transfer payments can take up to a week to arrive and will be confirmed as soon as funds have cleared.
        <br /><br />
        If the payment will be made by an alternative source such as your institution, you can provide them with the invoice link.
        <h4>Got a question?</h4>
        If you have any questions related to the invoice, just reply to this email and our Customer Service team will be happy to help.
        `
      },
      bodyProps: {
        hasLink: false,
        hasIntro: true,
        hasSignature: false
      }
    });
  }
}

export default EmailService;
