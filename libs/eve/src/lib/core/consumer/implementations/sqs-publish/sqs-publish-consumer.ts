import { SQS } from 'aws-sdk';

import { Consumer } from '../../consumer';

export class SqsPublishConsumer<T> implements Consumer<T> {
  private queueName: string;
  private sqs: SQS;

  constructor(sqs: SQS, queueName: string) {
    this.queueName = queueName;
    this.sqs = sqs;
  }

  async consume(inputEventOrEvents: T[] | T): Promise<void> {
    const queue = await this.getQueueUrl();
    const events = [].concat(inputEventOrEvents);
    for (const event of events) {
      await this.sendMessage(event, queue);
    }
  }

  private async getQueueUrl(): Promise<string> {
    const response = await this.sqs
      .getQueueUrl({ QueueName: this.queueName })
      .promise();
    const data = response?.$response?.data;
    if (!data) {
      return '';
    }
    return data.QueueUrl;
  }

  private async sendMessage(message: T, queue: string): Promise<void> {
    const params: SQS.SendMessageRequest = {
      MessageBody: JSON.stringify(message),
      QueueUrl: queue
    };
    await this.sqs.sendMessage(params).promise();
  }
}
