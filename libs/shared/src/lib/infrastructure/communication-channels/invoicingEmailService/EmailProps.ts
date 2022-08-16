import { cloneDeep } from 'lodash';

export interface EmailReceiver {
  email: string;
  name?: string;
}

export interface EmailContent {
  signatureJournal?: string;
  signatureName?: string;
  paragraph: string;
  ctaLink?: string;
  ctaText?: string;
  subject: string;
}

export interface EmailBodyProps {
  hasSignature: boolean;
  hasIntro: boolean;
  hasLink: boolean;
}

export interface EmailProps {
  bodyProps: EmailBodyProps;
  content: EmailContent;
  toUser: EmailReceiver;
  fromEmail: string;
  type: string;
}

const baseBodyProps: EmailBodyProps = {
  hasSignature: false,
  hasIntro: true,
  hasLink: false
};

const baseProps: EmailProps = {
  bodyProps: baseBodyProps,
  fromEmail: '',
  type: 'user',
  toUser: {
    email: '',
    name: ''
  },
  content: {
    paragraph: '',
    subject: ''
  }
};

export class EmailPropsBuilder {
  private _props: EmailProps;

  constructor() {
    this._props = cloneDeep(baseProps);
  }

  buildProps(): EmailProps {
    return cloneDeep(this._props);
  }

  addSender(sender: string) {
    this._props.fromEmail = sender;
    return this;
  }

  addReceiver(receiver: EmailReceiver): EmailPropsBuilder;
  addReceiver(email: string): EmailPropsBuilder;
  addReceiver(receiver: EmailReceiver | string) {
    if (typeof receiver === 'string') {
      this._props.toUser.email = receiver;
    } else {
      this._props.toUser = receiver;
    }
    return this;
  }

  addSubject(subject: string) {
    this._props.content.subject = subject;
    return this;
  }

  addParagraph(paragraph: string) {
    this._props.content.paragraph = paragraph;
    return this;
  }

  addContent(content: EmailContent) {
    this._props.content = content;
    return this;
  }
}
