import { v4 as uuidV4 } from 'uuid';
import { SNS } from 'aws-sdk';

import { Producer } from './producer';

export class SnsProducer implements Producer {
  private topicArn: string;
  private sns: SNS;

  constructor(
    private readonly secretAccessKey: string,
    private readonly accessKeyId: string,
    private readonly topicName: string,
    private readonly endpoint: string,
    private readonly region: string,
    private readonly eventNamespace: string,
    private readonly publisherName: string,
    private readonly serviceName: string,
    private readonly defaultMessageAttributes: Object = {}
  ) {
    this.sns = new SNS({
      secretAccessKey: this.secretAccessKey,
      accessKeyId: this.accessKeyId,
      endpoint: this.endpoint,
      region: this.region,
    });
  }

  async start() {
    const { TopicArn } = await this.sns
      .createTopic({ Name: this.topicName })
      .promise();

    this.topicArn = TopicArn;
  }

  async sendEvent(
    event: string,
    data: unknown,
    messageAttributes: Object = {},
    timestamp: string = new Date().toISOString(),
    id: string = uuidV4()
  ) {
    const message = this.createSnsMessage(event, data, timestamp, id);

    await this.sns
      .publish(this.createSnsPayload(message, messageAttributes))
      .promise();
  }

  private getEventName(actionName: string) {
    return `${this.eventNamespace}:${this.publisherName}:${this.serviceName}:${actionName}`;
  }

  private createSnsMessage(
    event: string,
    data: unknown,
    timestamp: string,
    id: string
  ): string {
    return JSON.stringify({
      event: this.getEventName(event),
      timestamp,
      data,
      id,
    });
  }

  private createSnsPayload(Message: string, messageAttributes: Object) {
    const attributes = Object.assign(
      {},
      this.defaultMessageAttributes,
      messageAttributes
    );

    const MessageAttributes = {};

    for (const prop in attributes) {
      MessageAttributes[prop] = {
        StringValue: attributes[prop],
        DataType: 'String',
      };
    }

    return {
      TopicArn: this.topicArn,
      MessageAttributes,
      Message,
    };
  }
}
