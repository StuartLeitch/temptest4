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
    let count = 0;
    for (const event of events) {
      try {
        await this.sendMessage(event, queue);
        count++;
      } catch (error) {
        console.log(error);
      }
    }
    console.log('Sent', count, 'events');
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
      MessageAttributes: this.parseMessageAttributes(
        (message as any).MessageAttributes
      ),
      QueueUrl: queue
    };
    await this.sqs.sendMessage(params).promise();
  }

  private parseMessageAttributes(attributes: any): SQS.MessageBodyAttributeMap {
    var map: {
      [key: string]: SQS.MessageAttributeValue;
    } = {};
    if (typeof attributes !== 'object') {
      return map;
    }
    for (const key in attributes) {
      const attribute = attributes[key];
      if (typeof attribute !== 'object') {
        continue;
      }

      const currentAttribute: SQS.MessageAttributeValue = {} as any;
      if (!attribute.stringValue) {
        continue;
      }
      currentAttribute.StringValue = attribute.stringValue;
      currentAttribute.DataType = 'String';
      map[key] = currentAttribute;
    }
    return map;
  }
}
