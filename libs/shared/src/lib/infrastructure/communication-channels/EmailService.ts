import EmailTemplate from '@pubsweet/component-email-templating';

import hindawiDefault from '../../../../../../config/default';
import gswConfig from '../../../../../../config/default-gsw';

import { Manuscript } from '../../modules/manuscripts/domain/Manuscript';
import { CatalogItem } from '../../modules/journals/domain/CatalogItem';
import { InvoiceItem } from '../../modules/invoices/domain/InvoiceItem';
import { Invoice } from '../../modules/invoices/domain/Invoice';

import {
  AutoConfirmMissingCountryNotificationTemplate,
  InvoiceCanBeConfirmedNotificationTemplate,
  InvoicePaymentFourthReminderTemplate,
  InvoicePaymentSecondReminderTemplate,
  InvoiceConfirmationReminderTemplate,
  InvoicePaymentFirstReminderTemplate,
  InvoicePaymentThirdReminderTemplate,
  InvoicePendingNotificationTemplate,
  ButtonLinkTemplate
} from './email-templates';

interface JournalConfig {
  logo?: string;
  address?: string;
  privacy?: string;
  ctaColor?: string;
  logoLink?: string;
  publisher?: string;
  footerText?: string;
}

let journalConfig: JournalConfig = {};

if (process.env.TENANT_NAME === 'GeoScienceWorld') {
  journalConfig = { ...gswConfig.journal };
  journalConfig.address = ''; // address is in privacy text
} else if (process.env.TENANT_NAME === 'Hindawi') {
  journalConfig = { ...hindawiDefault.journal };
  journalConfig.address = ''; // address is in privacy text
}

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

export type PaymentReminderType = 'first' | 'second' | 'third' | 'fourth';
type PaymentReminderTemplateMapper = {
  [key in PaymentReminderType]: (
    ...d: any
  ) => { subject: string; paragraph: string };
};

export class EmailService {
  private email: any;

  static createURL(path: string) {
    return `${process.env.FE_ROOT}${path}`;
  }

  static createSingleButton(label: string, link: string) {
    return ButtonLinkTemplate.build(label, link);
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
    const { paragraph, subject } = InvoicePendingNotificationTemplate.build(
      invoice
    );
    return this.createTemplate({
      type: 'user',
      fromEmail: senderEmail,
      toUser: {
        email: receiverEmail
      },
      content: {
        paragraph,
        subject,
        ...journalConfig
      },
      bodyProps: {
        hasLink: false,
        hasIntro: true,
        hasSignature: false
      }
    });
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
    const invoiceLink = EmailService.createSingleButton(
      'INVOICE DETAILS',
      EmailService.createURL(
        `/payment-details/${invoiceItem.invoiceId.id.toString()}`
      )
    );
    const {
      paragraph,
      subject
    } = InvoiceCanBeConfirmedNotificationTemplate.build({
      bankTransferCopyReceiverAddress,
      publisherName,
      catalogItem,
      invoiceItem,
      invoiceLink,
      manuscript,
      invoice
    });

    const templateProps = {
      type: 'user',
      fromEmail: `${senderName} <${senderAddress}>`,
      toUser: {
        email: manuscript.authorEmail,
        name: `${manuscript.authorFirstName} ${manuscript.authorSurname}`
      },
      content: {
        paragraph,
        subject,
        ...journalConfig
      },
      bodyProps: {
        hasLink: false,
        hasIntro: true,
        hasSignature: false
      }
    };
    if (templateProps.content.privacy) {
      templateProps.content.privacy = templateProps.content.privacy.replace(
        '[TO EMAIL]',
        manuscript.authorEmail
      );
    }
    return this.createTemplate(templateProps);
  }

  public autoConfirmMissingCountryNotification(
    invoice: Invoice,
    manuscript: Manuscript,
    receiverEmail: string,
    senderEmail: string
  ) {
    const invoiceLink = EmailService.createURL(
      `/payment-details/${invoice.invoiceId.id.toString()}`
    );
    const {
      paragraph,
      subject
    } = AutoConfirmMissingCountryNotificationTemplate.build(
      manuscript.customId,
      invoiceLink
    );

    return this.createTemplate({
      type: 'user',
      fromEmail: senderEmail,
      toUser: {
        email: receiverEmail
      },
      content: {
        paragraph,
        subject,
        ...journalConfig
      },
      bodyProps: {
        hasLink: false,
        hasIntro: true,
        hasSignature: false
      }
    });
  }

  public invoiceConfirmationReminder({
    articleCustomId,
    invoiceId,
    sender,
    author
  }: ConfirmationReminder) {
    const publisherName = process.env.TENANT_NAME;
    const invoiceButton = EmailService.createSingleButton(
      'INVOICE DETAILS',
      EmailService.createURL(`/payment-details/${invoiceId}`)
    );
    const { paragraph, subject } = InvoiceConfirmationReminderTemplate.build(
      articleCustomId,
      invoiceButton,
      publisherName
    );

    return this.createTemplate({
      type: 'user',
      fromEmail: `${sender.name} <${sender.email}>`,
      toUser: {
        email: author.email,
        name: author.name
      },
      content: {
        subject,
        paragraph,
        ...journalConfig
      },
      bodyProps: {
        hasLink: false,
        hasIntro: true,
        hasSignature: false
      }
    });
  }

  private getEmailDataForInvoicePaymentReminder(
    { catalogItem, invoice, manuscriptCustomId }: PaymentReminder,
    kind: PaymentReminderType,
    invoiceButton: string
  ) {
    const publisherName = process.env.TENANT_NAME;
    const template: PaymentReminderTemplateMapper = {
      first: InvoicePaymentFirstReminderTemplate.build,
      second: InvoicePaymentSecondReminderTemplate.build,
      third: InvoicePaymentThirdReminderTemplate.build,
      fourth: InvoicePaymentFourthReminderTemplate.build
    };

    return template[kind](
      manuscriptCustomId,
      catalogItem,
      invoice,
      invoiceButton,
      publisherName,
      journalConfig.logoLink
    );
  }

  public invoicePaymentReminder(
    data: PaymentReminder,
    kind: PaymentReminderType
  ) {
    const invoiceButton = EmailService.createSingleButton(
      'INVOICE DETAILS',
      EmailService.createURL(`/payment-details/${data.invoice.invoiceId}`)
    );

    const { paragraph, subject } = this.getEmailDataForInvoicePaymentReminder(
      data,
      kind,
      invoiceButton
    );

    return this.createTemplate({
      type: 'user',
      fromEmail: `${data.sender.name} <${data.sender.email}>`,
      toUser: {
        email: data.author.email,
        name: data.author.name
      },
      content: {
        subject,
        paragraph,
        ...journalConfig
      },
      bodyProps: {
        hasLink: false,
        hasIntro: true,
        hasSignature: false
      }
    });
  }
}
