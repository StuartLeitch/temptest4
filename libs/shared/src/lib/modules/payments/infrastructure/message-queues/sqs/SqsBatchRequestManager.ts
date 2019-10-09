// 22ZZBNHBRW

import {SQS} from 'aws-sdk';
import lodash = require('lodash');
import async from 'async';

class SqsBatchRequestManager {
  protected flushMessagesToBeDeletedIntervalHandler: any;

  protected localSendMessageBatchQueue: any;
  protected sendMessageBag: {[queueUrl: string]: Array<AWS.SQS.Message>};

  protected localDeleteMessageBatchQueue: any;
  protected deleteMessageBag: {[queueUrl: string]: Array<AWS.SQS.Message>};

  protected localChangeVisibilityTimeoutBatchQueue: any;
  protected client: AWS.SQS;

  constructor(
    client: AWS.SQS,
    flushMessagesToBeDeletedIntervalMilliseconds: number
  ) {
    this.client = client;

    this.initializeLocalMessageDeletionQueue();
    this.startFlushMessagesToBeDeletedInterval(
      flushMessagesToBeDeletedIntervalMilliseconds
    );
  }

  public deleteMessage(queueUrl: string, message: AWS.SQS.Message) {
    var self = this;

    self.deleteMessageBag[queueUrl].push(message);

    if (self.deleteMessageBag[queueUrl].length >= 10) {
      self.flushMessagesToBeDeleted(queueUrl);
    }
  }

  protected startFlushMessagesToBeDeletedInterval(milliseconds: number) {
    var self = this;

    self.flushMessagesToBeDeletedIntervalHandler = setInterval(function() {
      Object.keys(self.deleteMessageBag).forEach(function(key) {
        self.flushMessagesToBeDeleted(key);
      });
    }, milliseconds);
  }

  protected flushMessagesToBeDeleted(queueUrl: string) {
    var self = this;

    var deleteMessageBag = this.deleteMessageBag[queueUrl];
    self.deleteMessageBag[queueUrl] = [];
    var deleteMessageBagChunks = lodash.chunk(deleteMessageBag, 10);

    deleteMessageBagChunks.forEach(function(chunk: SQS.Message[]) {
      var params = self.getDeleteMessageBatchParams(queueUrl, chunk);
      self.localDeleteMessageBatchQueue.push(params);
    });
  }

  protected initializeLocalMessageDeletionQueue() {
    var self = this;

    self.localDeleteMessageBatchQueue = async.queue(function(
      params: SQS.DeleteMessageBatchRequest,
      done: () => void
    ) {
      self
        .getClient()
        .deleteMessageBatch(params, function(
          error: Error,
          result: SQS.DeleteMessageBatchResult
        ) {
          result.Failed.forEach(function(entry: AWS.SQS.BatchResultErrorEntry) {
            done();
          });
        });
    });
  }

  protected getDeleteMessageBatchParams(
    queueUrl: string,
    messages: SQS.Message[]
  ) {
    var params: SQS.DeleteMessageBatchRequest = {
      Entries: [],
      QueueUrl: queueUrl
    };

    messages.forEach(function(message: SQS.Message) {
      params.Entries.push({
        Id: message.MessageId,
        ReceiptHandle: message.ReceiptHandle
      });
    });

    return params;
  }

  protected getClient(): SQS {
    return this.client;
  }
}
