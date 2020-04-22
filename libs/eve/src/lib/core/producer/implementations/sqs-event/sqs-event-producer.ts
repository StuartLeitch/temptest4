import {SQS} from 'aws-sdk';

import {Event} from '../../../../modules/event';
import {Filter} from '../../../filters';
import {Producer} from '../../producer';
import {Selector} from '../../../selector';

interface Message {
  Message: string,
  MessageId: string,
  MessageAttributes: object,
  ReceiptHandle: string,
}

export class SQSEventProducer implements Producer<Event, void> {
  private defaultValues: Partial<Event> = {};
  private filters: Filter<Event>[] = [];

  constructor(
    private readonly sqs: SQS,
    private readonly queueName: string,
    private readonly deleteMessages = true) {
    this.queueName = queueName;
    this.sqs = sqs;
    this.deleteMessages = deleteMessages;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addSelector(selector: Selector<void>): void {
    throw new Error(`Method not implemented.${this}`);
  }

  removeSelectors(): void {
    throw new Error(`Method not implemented.${this}`);
  }

  async* produce(): AsyncGenerator<Event, void, undefined> {
    const queueUrl = await this.getQueueURL();

    while (true) {
      const messages = await this.receiveMessages(queueUrl);
      if (messages.length === 0) {
        break;
      }

      const filteredMessages = messages
        .map(this.extractSQSMessageBody)
        .filter(this.checkFilters.bind(this));

      for (const message of filteredMessages) {
        yield Object.assign({}, this.defaultValues, {
          MessageAttributes: message.MessageAttributes,
          MessageId: message.MessageId,
          Message: message.Message
        });

        if (this.deleteMessages) {
          await this.removeMessage(queueUrl, message);
        }
      }
    }
  }

  setDefaultValues(base: Partial<Event>): void {
    this.defaultValues = base;
  }

  addFilter(filter: Filter<Event>): void {
    this.filters.push(filter);
  }

  removeFilters(): void {
    this.filters = [];
  }

  private checkFilters(event: Event): boolean {
    for (const filter of this.filters) {
      if (!filter.match(event)) {
        return false;
      }
    }

    return true;
  }

  private async getQueueURL(): Promise<string> {
    const result = await this.sqs.listQueues({QueueNamePrefix: this.queueName}).promise();

    const queues = (result?.$response?.data as SQS.ListQueuesResult).QueueUrls;

    if (queues.length > 1) {
      throw new Error(`There are multiple queues named ${this.queueName} found`);
    }

    return queues[0];
  }

  private async receiveMessages(queueUrl: string): Promise<SQS.Message[]> {
    const request: SQS.Types.ReceiveMessageRequest = {QueueUrl: queueUrl, MaxNumberOfMessages: 10};
    const response = await this.sqs.receiveMessage(request).promise();

    if (!response?.$response?.data || !response?.$response?.data.Messages) {
      return []
    }

    return response?.$response?.data.Messages
  }

  private extractSQSMessageBody(message: SQS.Message): Message {
    return {
      ...JSON.parse(message.Body),
      ReceiptHandle: message.ReceiptHandle
    };
  }

  private async removeMessage(queueUrl: string, message: Message): Promise<void> {
    const deleteParams = {
      QueueUrl: queueUrl,
      ReceiptHandle: message.ReceiptHandle
    };
    await this.sqs
      .deleteMessage(deleteParams)
      .promise();
  }
}
