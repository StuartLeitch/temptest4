import { cloneDeep } from 'lodash';

import hindawiDefault from '../../../../../../config/default';
import gswConfig from '../../../../../../config/default-gsw';

import { Manuscript } from '../../modules/manuscripts/domain/Manuscript';
import { CatalogItem } from '../../modules/journals/domain/CatalogItem';
import { InvoiceItem } from '../../modules/invoices/domain/InvoiceItem';
import { Invoice } from '../../modules/invoices/domain/Invoice';

import { EmailPropsBuilder, EmailReceiver } from './EmailProps';
import { JournalProps, Email } from './Email';

import {
  AutoConfirmMissingCountryNotificationTemplate,
  InvoiceCanBeConfirmedNotificationTemplate,
  InvoiceCreditControlReminderTemplate,
  InvoicePaymentSecondReminderTemplate,
  InvoiceConfirmationReminderTemplate,
  InvoicePaymentFirstReminderTemplate,
  InvoicePaymentThirdReminderTemplate,
  InvoicePendingNotificationTemplate,
  ButtonLinkTemplate
} from './email-templates';

interface ConfirmationReminder {
  author: {
    email: string;
    name: string;
  };
  sender: {
    email: string;
    name: string;
  };
  articleCustomId: string;
  invoiceId: string;
}

export interface PaymentReminder {
  manuscriptCustomId: string;
  catalogItem: CatalogItem;
  invoice: Invoice;
  author: {
    email: string;
    name: string;
  };
  sender: {
    email: string;
    name: string;
  };
}

export type PaymentReminderType = 'first' | 'second' | 'third';
type PaymentReminderTemplateMapper = {
  [key in PaymentReminderType]: (
    ...d: any
  ) => { subject: string; paragraph: string };
};

export class EmailService {
  private journalProps: JournalProps;

  constructor(
    private mailingDisabled: boolean,
    private fePath: string,
    tenantName: string
  ) {
    if (tenantName === 'GeoScienceWorld') {
      this.journalProps = { ...gswConfig.journal };
      this.journalProps.address = ''; // address is in privacy text
    } else if (tenantName === 'Hindawi') {
      this.journalProps = { ...hindawiDefault.journal };
      this.journalProps.address = ''; // address is in privacy text
    }
  }

  private createURL(path: string) {
    return `${this.fePath}${path}`;
  }

  private createSingleButton(label: string, path: string) {
    return ButtonLinkTemplate.build(label, this.createURL(path));
  }

  public createInvoicePendingNotification(
    invoice: Invoice,
    receiverEmail: string,
    senderEmail: string
  ) {
    const content = InvoicePendingNotificationTemplate.build(invoice);
    const emailProps = new EmailPropsBuilder()
      .addSender(senderEmail)
      .addReceiver(receiverEmail)
      .addContent(content)
      .buildProps();

    return Email.create(emailProps, this.journalProps, this.mailingDisabled);
  }

  public createInvoicePaymentTemplate(
    manuscript: Manuscript,
    catalogItem: CatalogItem,
    invoiceItem: InvoiceItem,
    invoice: Invoice,
    bankTransferCopyReceiverAddress: string,
    senderAddress: string,
    senderName: string
  ) {
    const publisherName = process.env.TENANT_NAME;
    const invoiceLink = this.createSingleButton(
      'INVOICE DETAILS',
      `/payment-details/${invoiceItem.invoiceId.id.toString()}`
    );
    const content = InvoiceCanBeConfirmedNotificationTemplate.build({
      bankTransferCopyReceiverAddress,
      publisherName,
      catalogItem,
      invoiceItem,
      invoiceLink,
      manuscript,
      invoice
    });
    const receiver: EmailReceiver = {
      email: manuscript.authorEmail,
      name: `${manuscript.authorFirstName} ${manuscript.authorSurname}`
    };
    const emailProps = new EmailPropsBuilder()
      .addSender(`${senderName} <${senderAddress}>`)
      .addReceiver(receiver)
      .addContent(content)
      .buildProps();
    const newJournalTemplate = cloneDeep(this.journalProps);

    if (newJournalTemplate.privacy) {
      newJournalTemplate.privacy = newJournalTemplate.privacy.replace(
        '[TO EMAIL]',
        manuscript.authorEmail
      );
    }

    return Email.create(emailProps, newJournalTemplate, this.mailingDisabled);
  }

  public autoConfirmMissingCountryNotification(
    invoice: Invoice,
    manuscript: Manuscript,
    receiverEmail: string,
    senderEmail: string
  ) {
    const invoiceLink = this.createURL(
      `/payment-details/${invoice.invoiceId.id.toString()}`
    );
    const content = AutoConfirmMissingCountryNotificationTemplate.build(
      manuscript.customId,
      invoiceLink
    );

    const emailProps = new EmailPropsBuilder()
      .addSender(senderEmail)
      .addReceiver(receiverEmail)
      .addContent(content)
      .buildProps();

    return Email.create(emailProps, this.journalProps, this.mailingDisabled);
  }

  public invoiceConfirmationReminder({
    articleCustomId,
    invoiceId,
    sender,
    author
  }: ConfirmationReminder) {
    const publisherName = process.env.TENANT_NAME;
    const invoiceButton = this.createSingleButton(
      'INVOICE DETAILS',
      `/payment-details/${invoiceId}`
    );
    const content = InvoiceConfirmationReminderTemplate.build(
      articleCustomId,
      invoiceButton,
      publisherName
    );
    const receiver: EmailReceiver = {
      email: author.email,
      name: author.name
    };
    const emailProps = new EmailPropsBuilder()
      .addSender(`${sender.name} <${sender.email}>`)
      .addReceiver(receiver)
      .addContent(content)
      .buildProps();

    return Email.create(emailProps, this.journalProps, this.mailingDisabled);
  }

  private getEmailDataForInvoicePaymentReminder(
    { catalogItem, invoice, manuscriptCustomId }: PaymentReminder,
    kind: PaymentReminderType,
    invoiceButton: string
  ) {
    const publisherName = process.env.TENANT_NAME;
    const template: PaymentReminderTemplateMapper = {
      first: data => InvoicePaymentFirstReminderTemplate.build(data),
      second: data => InvoicePaymentSecondReminderTemplate.build(data),
      third: data => InvoicePaymentThirdReminderTemplate.build(data)
    };

    return template[kind]({
      manuscriptCustomId,
      catalogItem,
      invoice,
      invoiceButton,
      publisherName,
      publisherSite: this.journalProps.logoLink
    });
  }

  public invoicePaymentReminder(
    data: PaymentReminder,
    kind: PaymentReminderType
  ) {
    const invoiceButton = this.createSingleButton(
      'INVOICE DETAILS',
      `/payment-details/${data.invoice.invoiceId}`
    );

    const content = this.getEmailDataForInvoicePaymentReminder(
      data,
      kind,
      invoiceButton
    );

    const receiver: EmailReceiver = {
      email: data.author.email,
      name: data.author.name
    };
    const emailProps = new EmailPropsBuilder()
      .addSender(`${data.sender.name} <${data.sender.email}>`)
      .addReceiver(receiver)
      .addContent(content)
      .buildProps();

    return Email.create(emailProps, this.journalProps, this.mailingDisabled);
  }

  public invoiceCreditControlReminder(data: PaymentReminder) {
    const invoiceButton = this.createSingleButton(
      'INVOICE DETAILS',
      `/payment-details/${data.invoice.invoiceId}`
    );

    const content = InvoiceCreditControlReminderTemplate.build(
      data.manuscriptCustomId,
      data.catalogItem,
      data.invoice,
      invoiceButton,
      data.sender.name,
      this.journalProps.logoLink
    );
    const receiver: EmailReceiver = {
      email: data.author.email,
      name: data.author.name
    };
    const emailProps = new EmailPropsBuilder()
      .addSender(`${data.sender.name} <${data.sender.email}>`)
      .addReceiver(receiver)
      .addContent(content)
      .buildProps();

    return Email.create(emailProps, this.journalProps, this.mailingDisabled);
  }
}
