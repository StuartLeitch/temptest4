import { Consumer } from 'sqs-consumer';
import * as AWS from 'aws-sdk';
import { SQS } from 'aws-sdk';
import { get } from 'lodash';

import { QueueEventConsumer, Handler } from './consumer';
import { Event } from '../event';

export class SqsEventConsumer implements QueueEventConsumer {
  private sqsConsumer: Consumer;
  private sqs: SQS;
  private eventMap: {
    [key: string]: Array<Handler>;
  } = {};

  constructor(
    private readonly queueName: string,
    region?: string,
    sqsEndpoint?: string,
    accessKeyId?: string,
    secretAccessKey?: string
  ) {
    this.sqs = new AWS.SQS({
      region,
      accessKeyId,
      secretAccessKey,
      endpoint: sqsEndpoint,
    });
  }

  registerHandler(eventName: string, handler: Handler) {
    if (this.eventMap[eventName] == null) {
      this.eventMap[eventName] = [];
    }

    this.eventMap[eventName].push(handler);
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
        this.eventMap[eventName].map(async (handler) =>
          handler(JSON.parse(data))
        )
      );
    }
  }
}
