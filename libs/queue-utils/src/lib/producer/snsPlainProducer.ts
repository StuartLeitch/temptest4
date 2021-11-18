import * as AWS from 'aws-sdk';
import { SNS } from 'aws-sdk';

import { Producer } from './producer';

export class SnsPlainProducer implements Producer {
  private topicArn: string;
  private sns: SNS;

  constructor(
    private readonly topicName: string,
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

  async sendEvent(data: unknown) {
    await this.sns
      .publish(this.createMessagePayload(JSON.stringify(data), {}))
      .promise();
  }

  private createMessagePayload(
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
