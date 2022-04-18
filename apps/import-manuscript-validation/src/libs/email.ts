import * as AWS from 'aws-sdk';
import { SES } from 'aws-sdk';
import VError from 'verror';

export class EmailService {
  private readonly ses: SES;

  constructor(
    private readonly accessKey?: string,
    private readonly secretKey?: string,
    private readonly region?: string
  ) {
    this.ses = new AWS.SES({
      secretAccessKey: this.secretKey,
      accessKeyId: this.accessKey,
      region: this.region,
    });
  }

  async sendEmail(
    toAddresses: Array<string>,
    senderEmail: string,
    subject: string,
    body: string
  ): Promise<void> {
    const params: SES.SendEmailRequest = {
      Destination: {
        CcAddresses: [],
        ToAddresses: toAddresses,
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: body,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: senderEmail,
    };

    try {
      await this.ses.sendEmail(params).promise();
    } catch (err) {
      throw new VError(err);
    }
  }
}
