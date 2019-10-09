import * as AWS from 'aws-sdk';

// import Promise = require('bluebird');
import async = require('async');
// import lodash = require('lodash');

import {EncoderContract} from '../../../../../infrastructure/message-queues/contracts/Encoder';
import {ErrorHandlerContract} from '../../../../../infrastructure/message-queues/contracts/ErrorHandler';
import {JobContract} from '../../../../../infrastructure/message-queues/contracts/Job';

import {QueueAdapter} from '../QueueAdapter';

import {SqsConfig} from './SqsConfig';
import {SqsJob} from './SqsJob';

export class SqsAdapter extends QueueAdapter {
  protected config: SqsConfig;
  protected client: AWS.SQS;
  protected queueUrlPromises: {[queueName: string]: Promise<any>} = {};

  constructor(
    errorHandler: ErrorHandlerContract,
    encoder: EncoderContract,
    config: SqsConfig = new SqsConfig()
  ) {
    super(errorHandler, encoder, config);
  }

  public produce(queueName: string, payload: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const params: AWS.SQS.SendMessageRequest = await this.getSendMessageParamsPromise(
        {queueName, payload}
      );

      this.getClient().sendMessage(params, function(
        error: Error,
        result: AWS.SQS.SendMessageResult
      ) {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }

  public async consume(
    queueName: string,
    callback: (job: JobContract) => void
  ): Promise<void> {
    const params: AWS.SQS.ReceiveMessageRequest = await this.getReceiveMessageParamsPromise(
      queueName
    );

    let asyncQueue = async.queue(function(
      job: SqsJob,
      asyncQueueCallback: () => void
    ) {
      function yo() {
        asyncQueueCallback();
        asyncQueue.empty();
      }

      job.addAsyncQueueCallback(yo);
      callback(job);
    },
    this.config.getConcurrency(queueName));

    asyncQueue = Object.assign({}, asyncQueue, {
      empty: () => {
        const interval = setInterval(() => {
          if (asyncQueue.length() >= this.config.getConcurrency(queueName)) {
            clearInterval(interval);
            return;
          }

          this.getClient().receiveMessage(
            params,
            (error: Error, result: AWS.SQS.ReceiveMessageResult) => {
              if (result.Messages && result.Messages.length !== 0) {
                result.Messages.forEach((message: AWS.SQS.Message) => {
                  const job = new SqsJob(
                    this.errorHandler,
                    this.encoder.decode(message.Body),
                    params.QueueUrl,
                    this.client,
                    message
                  );
                  asyncQueue.push(job, error => {
                    this.errorHandler.handle(error);
                  });
                });
              }
              this.errorHandler.handle(error);
            }
          );
        }, this.config.getPollFrequencyMilliseconds(queueName));
      }
    });

    asyncQueue.empty();
  }

  protected getClient(): AWS.SQS {
    let {client, config} = this;

    if (!client) {
      this.client = new AWS.SQS(config);
    }

    return this.client;
  }

  protected getQueueUrlPromise(queueName: string): Promise<string> {
    const {config} = this;

    if (!this.queueUrlPromises[queueName]) {
      const params = config.getGetQueueUrlParams(queueName);

      this.queueUrlPromises[queueName] = new Promise((resolve, reject) => {
        this.getClient().getQueueUrl(params, function(error, result) {
          if (error) {
            if (error.code === 'AWS.SimpleQueueService.NonExistentQueue') {
              return this.getCreateQueuePromise(queueName);
            } else {
              reject(error);
            }
          }

          resolve(result.QueueUrl);
        });
      });
    }

    return this.queueUrlPromises[queueName];
  }

  protected getCreateQueuePromise(queueName: string): Promise<unknown> {
    var self = this;
    return new Promise(function(resolve, reject) {
      self
        .getClient()
        .createQueue(self.config.getCreateQueueParams(queueName), function(
          error: Error,
          result: AWS.SQS.CreateQueueResult
        ) {
          if (error) {
            reject(error);
          }
          resolve(result.QueueUrl);
        });
    });
  }

  protected async getSendMessageParamsPromise({
    queueName,
    payload
  }: {
    queueName: string;
    payload: any;
  }): Promise<AWS.SQS.SendMessageRequest> {
    const queueUrl: string = await this.getQueueUrlPromise(queueName);

    return this.config.getSendMessageParams(
      queueName,
      queueUrl,
      this.encoder.encode(payload)
    );
  }

  protected async getReceiveMessageParamsPromise(
    queueName: string
  ): Promise<AWS.SQS.ReceiveMessageRequest> {
    const queueUrl: string = await this.getQueueUrlPromise(queueName);
    return this.config.getReceiveMessageParams(queueName, queueUrl);
  }
}
