import * as AWS from 'aws-sdk';

import {JobContract} from '../../../../../infrastructure/message-queues/contracts/Job';
import {ErrorHandlerContract} from '../../../../../infrastructure/message-queues/contracts/ErrorHandler';

export class SqsJob extends JobContract {
  private queueUrl: string;
  private client: AWS.SQS;
  private message: AWS.SQS.Message;
  private asyncQueueCallback: () => void;

  constructor(
    errorHandler: ErrorHandlerContract,
    payload: any,
    queueUrl: string,
    client: AWS.SQS,
    message: AWS.SQS.Message
  ) {
    super(errorHandler, payload);
    this.queueUrl = queueUrl;
    this.client = client;
    this.message = message;
  }

  public addAsyncQueueCallback(asyncQueueCallback: () => void) {
    this.asyncQueueCallback = asyncQueueCallback;
  }

  public delete(): Promise<unknown> {
    this.deleted = true;

    const params = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: this.message.ReceiptHandle
    };

    return new Promise((resolve, reject) => {
      this.client.deleteMessage(params, (error: Error, data) => {
        if (error) {
          reject(error);
        }

        resolve(data);
      });
    });
  }

  public done() {
    this.asyncQueueCallback();
  }

  public release(): Promise<unknown> {
    var self = this;

    self.released = true;

    var params = {
      QueueUrl: self.queueUrl,
      ReceiptHandle: self.message.ReceiptHandle,
      VisibilityTimeout: 0
    };

    return new Promise(function(resolve, reject) {
      self.client.changeMessageVisibility(params, function(error: Error, data) {
        if (error) {
          reject(error);
        }

        resolve(data);
      });
    });
  }
}
