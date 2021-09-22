import { Consumer } from 'sqs-consumer';
import { SQS } from 'aws-sdk';
import { get } from 'lodash';

import { QueueConsumer, Handler } from './consumer';
import { Event } from '../event';

export class SqsQueueConsumer implements QueueConsumer {
  private sqsConsumer: Consumer;
  private sqs: SQS;
  private eventMap: {
    [key: string]: Array<Handler>;
  } = {};

  constructor(
    private readonly secretAccessKey: string,
    private readonly accessKeyId: string,
    private readonly queueName: string,
    private readonly endpoint: string,
    private readonly region: string
  ) {
    this.sqs = new SQS({
      secretAccessKey: this.secretAccessKey,
      accessKeyId: this.accessKeyId,
      endpoint: this.endpoint,
      region: this.region,
    });
  }

  registerHandler(event: string, handler: Handler) {
    if (this.eventMap[event] == null) {
      this.eventMap[event] = [];
    }

    this.eventMap[event].push(handler);
  }

  async start() {
    let { QueueUrl } = await this.sqs
      .getQueueUrl({ QueueName: this.queueName })
      .promise();

    this.sqsConsumer = Consumer.create({
      sqs: this.sqs,
      queueUrl: QueueUrl,
      handleMessage: this.processMessage,
    });

    this.sqsConsumer.on('error', console.error);

    this.sqsConsumer.on('processing_error', console.error);

    this.sqsConsumer.start();
  }

  private async processMessage(message: SQS.Message) {
    const body = JSON.parse(get(message, 'Body'));

    await this.handleEvent(JSON.parse(get(body, 'Message')));
  }

  private extractActionName(eventName: string): string {
    return [...eventName.split(':')].pop();
  }

  private async handleEvent({ event, data }: Event) {
    const eventName = this.extractActionName(event);

    await Promise.all(
      this.eventMap[eventName].map(async (handler) => handler(data))
    );
  }
}
