import {JsonController, Get} from 'routing-controllers';
import {Emailer} from '@hindawi/shared';

@JsonController('/mail')
export class MailController {
  @Get()
  public sendDummyMail() {
    const mailer = new Emailer();
    return mailer
      .createTemplate({
        type: 'user',
        fromEmail: 'alexandru.munteanu@hindawi.com',
        toUser: {
          email: 'alexandru.munteanu@hindawi.com',
          name: `Testez`
        },
        content: {
          ctaText: 'PAY INVOICE',
          signatureJournal: 'Finance & Bubblegum',
          signatureName: `Hindawi Finance Suits`,
          subject: `Invoice #123 emitted`,
          paragraph:
            'Please visit Phenom Invoice and pay the attached invoice.',
          unsubscribeLink: `http://www.google.com`,
          ctaLink: `localhost:4200/payment/invoice-1/payer`
        },
        bodyProps: {
          hasLink: true,
          hasIntro: true,
          hasSignature: true
        }
      })
      .sendEmail();
  }
}
