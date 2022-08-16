import { cloneDeep } from 'lodash';

import hindawiDefault from '../../../../../../../config/default';
import gswConfig from '../../../../../../../config/default-gsw';
import importManuscriptConfig from '../../../../../../../config/importManuscript';

import { Manuscript } from '../../../modules/manuscripts/domain/Manuscript';
import { CatalogItem } from '../../../modules/journals/domain/CatalogItem';
import { InvoiceItem } from '../../../modules/invoices/domain/InvoiceItem';
import { Invoice } from '../../../modules/invoices/domain/Invoice';

import { EmailPropsBuilder, EmailReceiver } from './EmailProps';
import { JournalProps, Email } from './Email';

import {
  AutoConfirmMissingCountryNotificationTemplate,
  InvoiceCanBeConfirmedNotificationTemplate,
  PackageUnsuccessfulValidationTemplate,
  InvoiceCreditControlReminderTemplate,
  InvoicePaymentSecondReminderTemplate,
  InvoiceConfirmationReminderTemplate,
  InvoicePaymentFirstReminderTemplate,
  InvoicePaymentThirdReminderTemplate,
  PackageSuccessfulValidationTemplate,
  InvoicePendingNotificationTemplate,
  PaymentReminderBuildData,
  UnsuccessTextTemplate,
  SuccessTextTemplate,
  ReasonsListTemplate,
  ButtonLinkTemplate,
  SectionTemplate,
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
  [key in PaymentReminderType]: (d: PaymentReminderBuildData) => {
    subject: string;
    paragraph: string;
  };
};

export class EmailService {
  private journalProps: JournalProps;

  constructor(
    private readonly mailingDisabled: boolean,
    private readonly basePath: string,
    private readonly tenantName: string,
    private readonly antiFraudSupportEmail: string,
    private readonly antiFraudPolicyUrl: string
  ) {
    if (this.tenantName === 'GeoScienceWorld') {
      this.journalProps = { ...gswConfig.journal };
      this.journalProps.address = ''; // address is in privacy text
    } else if (this.tenantName === 'Hindawi') {
      this.journalProps = { ...hindawiDefault.journal };
      this.journalProps.address = ''; // address is in privacy text
    } else if (this.tenantName === 'ImportManuscript') {
      this.journalProps = { ...importManuscriptConfig.journal };
      this.journalProps.address = '';
    }
  }

  private createURL(path: string) {
    return `${this.basePath}${path}`;
  }

  private createSingleButton(label: string, path: string) {
    return ButtonLinkTemplate.build(label, this.createURL(path));
  }

  private createSuccessText(text: string) {
    return SuccessTextTemplate.build(text);
  }

  private createSectionText(text: string) {
    return SectionTemplate.build(text);
  }

  private createUnsuccessText(text: string) {
    return UnsuccessTextTemplate.build(text);
  }

  private createReasonsList(reasons: string[]) {
    return ReasonsListTemplate.build(reasons);
  }

  public createSuccesfulValidationNotification(
    fileName: string,
    senderEmail: string,
    receiver: { name: string; email: string },
    manuscriptTitle: string,
    submissionUrl: string
  ): Email {
    const successTxt = `✓ Your uploaded zip file has been successfully analyzed!`;
    const manuscriptTitleText = manuscriptTitle;

    const reviewSubmissionButton = this.createSingleButton(
      'REVIEW SUBMISSION',
      submissionUrl
    );

    const successTextSection = this.createSuccessText(successTxt);
    const manuscriptTitleTextSection =
      this.createSectionText(manuscriptTitleText);

    const content = PackageSuccessfulValidationTemplate.build(
      fileName,
      manuscriptTitleTextSection,
      reviewSubmissionButton,
      successTextSection
    );

    const emailProps = new EmailPropsBuilder()
      .addSender(senderEmail)
      .addReceiver(receiver)
      .addContent(content)
      .buildProps();

    return Email.create(emailProps, this.journalProps, this.mailingDisabled);
  }

  public createUnsuccesfulValidationNotification(
    fileName: string,
    senderEmail: string,
    receiver: { name: string; email: string },
    error: any,
    importManuscriptPath: string
  ): Email {
    console.log(JSON.stringify(receiver, null, 2));
    const unsuccessTxt = '⚠ Your uploaded zip file could not be analyzed!';

    const gotoPhenomButton = ButtonLinkTemplate.build(
      'GO TO PHENOM',
      importManuscriptPath
    );
    const errorReasons = [error.message.split('VError:').pop()];
    const unsuccessText = this.createUnsuccessText(unsuccessTxt);
    const reasonsList = this.createReasonsList(errorReasons);

    const content = PackageUnsuccessfulValidationTemplate.build(
      fileName,
      reasonsList,
      gotoPhenomButton,
      unsuccessText
    );

    const emailProps = new EmailPropsBuilder()
      .addSender(senderEmail)
      .addReceiver(receiver)
      .addContent(content)
      .buildProps();

    return Email.create(emailProps, this.journalProps, this.mailingDisabled);
  }

  public createInvoicePendingNotification(
    invoice: Invoice,
    receiverEmail: string,
    senderEmail: string
  ): Email {
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
  ): Email {
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
      invoice,
    });
    const receiver: EmailReceiver = {
      email: manuscript.authorEmail,
      name: `${manuscript.authorFirstName} ${manuscript.authorSurname}`,
    };
    const emailProps = new EmailPropsBuilder()
      .addSender(`${senderName} <${senderAddress}>`)
      .addReceiver(receiver)
      .addContent(content)
      .buildProps();
    const newJournalTemplate = cloneDeep(this.journalProps);

    return Email.create(emailProps, newJournalTemplate, this.mailingDisabled);
  }

  public autoConfirmMissingCountryNotification(
    invoice: Invoice,
    manuscript: Manuscript,
    receiverEmail: string,
    senderEmail: string
  ): Email {
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
    author,
  }: ConfirmationReminder): Email {
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
      name: author.name,
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
      first: (data) => InvoicePaymentFirstReminderTemplate.build(data),
      second: (data) => InvoicePaymentSecondReminderTemplate.build(data),
      third: (data) => InvoicePaymentThirdReminderTemplate.build(data),
    };

    return template[kind]({
      manuscriptCustomId,
      catalogItem,
      invoice,
      invoiceButton,
      publisherName,
      publisherSite: this.journalProps.logoLink,
      antiFraudPolicyUrl: this.antiFraudPolicyUrl,
      antiFraudSupportEmail: this.antiFraudSupportEmail,
    });
  }

  public invoicePaymentReminder(
    data: PaymentReminder,
    kind: PaymentReminderType
  ): Email {
    const invoiceButton = this.createSingleButton(
      'INVOICE DETAILS',
      `/payment-details/${data.invoice.invoiceId.id.toString()}`
    );

    const content = this.getEmailDataForInvoicePaymentReminder(
      data,
      kind,
      invoiceButton
    );

    const receiver: EmailReceiver = {
      email: data.author.email,
      name: data.author.name,
    };
    const emailProps = new EmailPropsBuilder()
      .addSender(`${data.sender.name} <${data.sender.email}>`)
      .addReceiver(receiver)
      .addContent(content)
      .buildProps();

    return Email.create(emailProps, this.journalProps, this.mailingDisabled);
  }

  public invoiceCreditControlReminder(data: PaymentReminder): Email {
    const invoiceButton = this.createSingleButton(
      'INVOICE DETAILS',
      `/payment-details/${data.invoice.invoiceId.id.toString()}`
    );

    const content = InvoiceCreditControlReminderTemplate.build(
      data.manuscriptCustomId,
      data.catalogItem,
      data.invoice,
      invoiceButton,
      data.sender.name,
      this.journalProps.logoLink,
      this.antiFraudSupportEmail,
      this.antiFraudPolicyUrl
    );
    const receiver: EmailReceiver = {
      email: data.author.email,
      name: data.author.name,
    };
    const emailProps = new EmailPropsBuilder()
      .addSender(`${data.sender.name} <${data.sender.email}>`)
      .addReceiver(receiver)
      .addContent(content)
      .buildProps();

    return Email.create(emailProps, this.journalProps, this.mailingDisabled);
  }
}
