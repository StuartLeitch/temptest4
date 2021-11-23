import { v4 as uuidV4 } from 'uuid';
import * as AWS from 'aws-sdk';
import { SNS } from 'aws-sdk';

import { Producer } from './producer';

export class SnsEventProducer implements Producer {
  private topicArn: string;
  private sns: SNS;

  constructor(
    private readonly topicName: string,
    private readonly eventNamespace: string,
    private readonly publisherName: string,
    private readonly serviceName: string,
    private readonly defaultMessageAttributes: Record<string, unknown> = {},
    private readonly awsProfile?: string
  ) {
    if (this.awsProfile) {
      const credentials = new AWS.SharedIniFileCredentials({
        profile: this.awsProfile,
      });
      AWS.config.credentials = credentials;
    }

    this.sns = new SNS();
  }

  async start() {
    const { TopicArn } = await this.sns
      .createTopic({ Name: this.topicName })
      .promise();

    this.topicArn = TopicArn;
  }

  async sendEvent(
    data: unknown,
    event: string,
    timestamp: string = new Date().toISOString(),
    id: string = uuidV4(),
    messageAttributes: Record<string, unknown> = {}
  ) {
    const message = this.createEventMessage(event, data, timestamp, id);

    await this.sns
      .publish(this.createEventPayload(message, messageAttributes))
      .promise();
  }

  private getEventName(actionName: string) {
    return `${this.eventNamespace}:${this.publisherName}:${this.serviceName}:${actionName}`;
  }

  private createEventMessage(
    event: string,
    data: unknown,
    timestamp: string,
    id: string
  ): string {
    return JSON.stringify({
      event: this.getEventName(event),
      timestamp,
      data: JSON.stringify(data),
      id,
    });
  }

  private createEventPayload(
    Message: string,
    messageAttributes: Record<string, unknown>
  ) {
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
