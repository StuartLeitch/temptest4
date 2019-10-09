import * as AWS from 'aws-sdk';
import {SQSMock} from './mocks/SQSMock';

require('dotenv').config();

import {
  SqsConfig,
  SqsQueueConfig
} from '../../src/lib/modules/payments/infrastructure/message-queues/sqs/SqsConfig';
import {JsonEncoder} from '../../src/lib/modules/payments/infrastructure/message-queues/JsonEncoder';
import {SqsAdapter} from '../../src/lib/modules/payments/infrastructure/message-queues/sqs/SqsAdapter';
import {StdOutErrorHandler} from '../../src/lib/modules/payments/infrastructure/message-queues/StdOutErrorHandler';

import {ConcurrencyConfig} from './helpers/ConcurrencyConfig';

class TestableSqsAdapter extends SqsAdapter {
  public config: SqsConfig;

  public getClient(): any {
    const client = new SQSMock({});
    this.client = client as any;
    return client;
  }

  public async getQueueUrlPromise(queueName: string): Promise<string> {
    return super.getQueueUrlPromise(queueName);
  }

  public getCreateQueuePromise(queueName: string): Promise<unknown> {
    return super.getCreateQueuePromise(queueName);
  }

  public getSendMessageParamsPromise({
    queueName,
    payload
  }: {
    queueName: string;
    payload: any;
  }): Promise<AWS.SQS.SendMessageRequest> {
    return super.getSendMessageParamsPromise({queueName, payload});
  }

  public getReceiveMessageParamsPromise(
    queueName: string
  ): Promise<AWS.SQS.ReceiveMessageRequest> {
    return super.getReceiveMessageParamsPromise(queueName);
  }
}

const encoder = new JsonEncoder();
const errorHandler = new StdOutErrorHandler();

const config = new SqsConfig();
config.accessKeyId = process.env.SQS_ACCESSKEYID;
config.secretAccessKey = process.env.SQS_SECRETACCESSKEY;
config.region = process.env.SQS_REGION;
config.consumeConcurrencies = ConcurrencyConfig;

const test_concurrency_1_QueueConfig = new SqsQueueConfig();
test_concurrency_1_QueueConfig.pollFrequencyMilliseconds = 1000;

const test_concurrency_2_QueueConfig = new SqsQueueConfig();
test_concurrency_2_QueueConfig.pollFrequencyMilliseconds = 1000;

const test_config_QueueConfig = new SqsQueueConfig();
test_config_QueueConfig.pollFrequencyMilliseconds = 2000;
test_config_QueueConfig.sendMessageParams = {
  QueueUrl: 'test_config',
  MessageBody: 'test_config',
  DelaySeconds: 100
};
test_config_QueueConfig.receiveMessageParams = {
  QueueUrl: 'test_config',
  VisibilityTimeout: 100,
  WaitTimeSeconds: 100
};
test_config_QueueConfig.changeMessageVisibilityParams = {
  QueueUrl: 'test_config',
  ReceiptHandle: 'test_config',
  VisibilityTimeout: 100
};
test_config_QueueConfig.createQueueParams = {
  QueueName: 'test_config',
  Attributes: {test_config: 'test_config'}
};
test_config_QueueConfig.getQueueUrlParams = {
  QueueName: 'test_config',
  QueueOwnerAWSAccountId: 'test_config'
};

config.queueConfigs['test_concurrency_1'] = test_concurrency_1_QueueConfig;
config.queueConfigs['test_concurrency_2'] = test_concurrency_2_QueueConfig;
config.queueConfigs['test_config'] = test_config_QueueConfig;

export default new TestableSqsAdapter(errorHandler, encoder, config);
