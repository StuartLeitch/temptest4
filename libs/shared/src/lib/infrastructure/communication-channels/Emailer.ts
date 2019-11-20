import EmailTemplate from '@pubsweet/component-email-templating';

export interface EmailAdapter {
  sendEmail(): Promise<any>;
}

interface TemplateProps {
  type: string;
  fromEmail: string;
  toUser: {
    email: string;
    name?: string;
  };
  content: {
    ctaText: string;
    signatureJournal?: string;
    signatureName?: string;
    subject: string;
    paragraph?: string;
    unsubscribeLink: string;
    ctaLink?: string;
  };
  bodyProps: {
    hasLink: boolean;
    hasIntro: boolean;
    hasSignature: boolean;
  };
}

class Emailer implements EmailAdapter {
  email: any;
  constructor() {}

  public createTemplate(templateProps: TemplateProps): EmailAdapter {
    this.email = new EmailTemplate(templateProps);
    return this;
  }

  public sendEmail() {
    return this.email.sendEmail();
  }
}

export default Emailer;
