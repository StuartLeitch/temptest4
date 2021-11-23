import { Consumer } from 'sqs-consumer';
import * as AWS from 'aws-sdk';
import { SQS } from 'aws-sdk';
import { get } from 'lodash';

import { QueueConsumer, Handler } from './consumer';

export class SqsPlainConsumer implements QueueConsumer<null> {
  private sqsConsumer: Consumer;
  private sqs: SQS;
  private handlers: Array<Handler> = [];

  constructor(
    private readonly queueName: string,
    private readonly awsProfile?: string
  ) {
    if (this.awsProfile) {
      const credentials = new AWS.SharedIniFileCredentials({
        profile: this.awsProfile,
      });
      AWS.config.credentials = credentials;
    }

    this.sqs = new SQS();
  }

  registerHandler(handler: Handler) {
    this.handlers.push(handler);
  }

  async start() {
    const { QueueUrl } = await this.sqs
      .getQueueUrl({ QueueName: this.queueName })
      .promise();

    this.sqsConsumer = Consumer.create({
      sqs: this.sqs,
      queueUrl: QueueUrl,
      handleMessage: this.processMessage.bind(this),
    });

    this.sqsConsumer.on('error', (err) => {
      console.error(err.message);
      process.exit(1);
    });

    this.sqsConsumer.on('processing_error', (err) => {
      console.error(err.message);
    });

    this.sqsConsumer.start();
  }

  private async processMessage(message: SQS.Message) {
    const body = JSON.parse(get(message, 'Body'));
    await Promise.all(this.handlers.map(async (handler) => handler(body)));
  }
}
