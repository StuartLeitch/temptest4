import { Consumer } from 'sqs-consumer';
import * as AWS from 'aws-sdk';
import { SQS } from 'aws-sdk';
import { get } from 'lodash';

import { QueueConsumer, Handler } from './consumer';
import { Event } from '../event';

interface SqsEventConsumerOptions {
  event: string;
}

export class SqsEventConsumer
  implements QueueConsumer<SqsEventConsumerOptions> {
  private sqsConsumer: Consumer;
  private sqs: SQS;
  private eventMap: {
    [key: string]: Array<Handler>;
  } = {};

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

  registerHandler(handler: Handler, options: SqsEventConsumerOptions) {
    const { event } = options;
    if (this.eventMap[event] == null) {
      this.eventMap[event] = [];
    }

    this.eventMap[event].push(handler);
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
    await this.handleEvent(body);
  }

  private extractActionName(eventName: string): string {
    return [...eventName.split(':')].pop();
  }

  private async handleEvent({ event, data }: Event) {
    const eventName = this.extractActionName(event);

    const handlers = this.eventMap[eventName];

    if (handlers && Array.isArray(handlers)) {
      await Promise.all(
        this.eventMap[eventName].map(async (handler) => handler(data))
      );
    }
  }
}
