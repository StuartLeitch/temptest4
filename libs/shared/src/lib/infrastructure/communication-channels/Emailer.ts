import EmailTemplate from '@pubsweet/component-email-templating';

export interface EmailCommunicator {
  sendEmail(): Promise<any>;
}

export interface EmailerConfig {
  mailer: {
    path: {
      transport: any;
    };
  };
}

class Emailer implements EmailCommunicator {
  email: any;
  constructor(private config?: EmailerConfig) {}

  public createTemplate(templateProps): EmailCommunicator {
    this.email = new EmailTemplate(templateProps);
    return this;
  }

  public sendEmail() {
    return this.email.sendEmail();
  }
}

export default Emailer;
