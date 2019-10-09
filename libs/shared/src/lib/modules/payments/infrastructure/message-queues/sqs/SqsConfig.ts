import {SQS} from 'aws-sdk';

import {ConfigContract} from '../../../../../infrastructure/message-queues/contracts/Config';

export class SqsQueueConfig {
  // * http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessage-property
  sendMessageParams: SQS.SendMessageRequest = {
    QueueUrl: null,
    MessageBody: null,
    DelaySeconds: 0
  };

  // * http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#receiveMessage-property
  receiveMessageParams: SQS.ReceiveMessageRequest = {
    QueueUrl: null,
    VisibilityTimeout: 60,
    WaitTimeSeconds: 5
  };

  // * http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#changeMessageVisibility-property
  changeMessageVisibilityParams: SQS.ChangeMessageVisibilityRequest = {
    QueueUrl: null,
    ReceiptHandle: null,
    VisibilityTimeout: 0
  };

  // * http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#createQueue-property
  createQueueParams: SQS.CreateQueueRequest = {
    QueueName: null,
    Attributes: null
  };

  getQueueUrlParams: SQS.GetQueueUrlRequest = {
    QueueName: null,
    QueueOwnerAWSAccountId: null
  };

  pollFrequencyMilliseconds: number = 500;
}

export class SqsConfig extends ConfigContract {
  apiVersion: string = '2012-11-05';
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  signatureVersion: string = 'v4';
  defaultConcurrency: number = 1;
  queueConfigs: {[name: string]: SqsQueueConfig} = {};
  defaultQueueConfig: SqsQueueConfig = new SqsQueueConfig();

  public getSendMessageParams(
    queueName: string,
    queueUrl: string,
    payload: string
  ): SQS.SendMessageRequest {
    let params: SQS.SendMessageRequest = Object.assign(
      {},
      this.defaultQueueConfig.sendMessageParams
    );

    if (
      this.queueConfigs[queueName] &&
      this.queueConfigs[queueName].sendMessageParams
    ) {
      params = Object.assign(
        params,
        this.queueConfigs[queueName].sendMessageParams
      );
    }

    params.QueueUrl = queueUrl;
    params.MessageBody = payload;

    return params;
  }

  public getReceiveMessageParams(
    queueName: string,
    queueUrl: string
  ): SQS.ReceiveMessageRequest {
    let params: SQS.ReceiveMessageRequest = Object.assign(
      {},
      this.defaultQueueConfig.receiveMessageParams
    );

    if (
      this.queueConfigs[queueName] &&
      this.queueConfigs[queueName].receiveMessageParams
    ) {
      params = Object.assign(
        params,
        this.queueConfigs[queueName].receiveMessageParams
      );
    }

    params.QueueUrl = queueUrl;

    return params;
  }

  public getCreateQueueParams(queueName: string): SQS.CreateQueueRequest {
    let params: AWS.SQS.CreateQueueRequest = Object.assign(
      {},
      this.defaultQueueConfig.createQueueParams
    );

    if (
      this.queueConfigs[queueName] &&
      this.queueConfigs[queueName].createQueueParams
    ) {
      params = Object.assign(
        params,
        this.queueConfigs[queueName].createQueueParams
      );
    }

    params.QueueName = queueName;

    return params;
  }

  public getGetQueueUrlParams(queueName): SQS.GetQueueUrlRequest {
    let params: SQS.GetQueueUrlRequest = Object.assign(
      {},
      this.defaultQueueConfig.getQueueUrlParams
    );

    if (
      this.queueConfigs[queueName] &&
      this.queueConfigs[queueName].getQueueUrlParams
    ) {
      params = Object.assign(
        params,
        this.queueConfigs[queueName].getQueueUrlParams
      );
    }

    params.QueueName = queueName;

    return params;
  }

  public getPollFrequencyMilliseconds(queueName: string): number {
    let pollFrequencyMilliseconds = this.defaultQueueConfig
      .pollFrequencyMilliseconds;

    if (
      this.queueConfigs[queueName] &&
      this.queueConfigs[queueName].pollFrequencyMilliseconds
    ) {
      pollFrequencyMilliseconds = this.queueConfigs[queueName]
        .pollFrequencyMilliseconds;
    }

    return pollFrequencyMilliseconds;
  }
}
