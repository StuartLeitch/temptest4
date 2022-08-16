import EmailTemplate from '@pubsweet/component-email-templating';

import { EmailProps } from './EmailProps';

export interface JournalProps {
  logo?: string;
  address?: string;
  privacy?: string;
  ctaColor?: string;
  logoLink?: string;
  publisher?: string;
  footerText?: string;
}

type TenantEmailProps = EmailProps & {
  content: JournalProps;
};

interface BasicEmail {
  sendEmail(): Promise<unknown>;
}

export class Email {
  private email: BasicEmail;

  private constructor(
    private mailingDisabled: boolean,
    template: TenantEmailProps
  ) {
    this.email = new EmailTemplate(template);
  }

  static create(
    template: EmailProps,
    tenantProps: JournalProps,
    mailingDisabled: boolean
  ): Email {
    if (tenantProps?.privacy) {
      tenantProps.privacy = tenantProps.privacy.replace(
        '[TO EMAIL]',
        template.toUser.email
      );
    }
    const finalTemplate = {
      ...template,
      content: {
        ...template.content,
        ...tenantProps,
      },
    };
    return new Email(mailingDisabled, finalTemplate);
  }

  async sendEmail(): Promise<unknown> {
    if (!this.mailingDisabled) {
      return this.email.sendEmail();
    }
  }
}
