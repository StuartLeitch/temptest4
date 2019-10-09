import {Service} from './Service';
import {Request} from './Request';
import {Queue} from './Queue';
import * as awsErrors from './AWSErrors';

const queues = {};

export class SQSMock extends Service {
  addPermission(params, callback) {
    return [this, params, callback];
    // TODO: fix params
  }

  changeMessageVisibility(parameters, callback) {
    function formatRequest(params) {
      return cb => {
        const error = checkParams(params, [
          'QueueUrl',
          'ReceiptHandle',
          'VisibilityTimeout'
        ]);

        if (error) {
          return cb(error);
        }

        if (params.VisibilityTimeout > 43200) {
          const visibilityError = new awsErrors.InvalidParameterValueError(
            params.VisibilityTimeout,
            'Total VisibilityTimeout for the message is beyond the limit [43200 seconds]'
          );
          return cb(visibilityError);
        }

        connectToQueue(params.QueueUrl, (err, res) => {
          if (err) {
            return cb(err);
          }

          const queue = res.queue;
          const queueCol = queue.col;
          const query = {ack: params.ReceiptHandle, deleted: {$exists: false}};
          const update = {
            $set: {
              // visible: moment()
              //   .add(params.VisibilityTimeout, 'seconds')
              //   .toISOString()
            }
          };

          queueCol.findOneAndUpdate(query, update, err => {
            if (err) {
              return cb(err);
            }

            cb(null, {});
          });
        });
      };
    }

    return createRequest.call(this, formatRequest, parameters, callback);
  }

  changeMessageVisibilityBatch(params, callback) {
    return [this, params, callback];
    // TODO: fix params
  }

  createQueue(parameters, callback) {
    function formatRequest(params) {
      return cb => {
        // console.info('Calling createQueue. Arguments normalized: %o', {
        //   params,
        //   cb
        // });

        const error = checkParams(params, ['QueueName']);

        if (error) {
          // debug("Invalid parameters");
          return cb(error);
        }

        const queueUrl = `${params.QueueName}`;
        const defaultSettings = {
          Created: new Date().toISOString(),
          DelaySeconds: 0,
          MaximumMessageSize: 262144,
          MessageRetentionPeriod: 345600,
          ReceiveMessageWaitTimeSeconds: 0,
          VisibilityTimeout: 30
        };
        const suppliedSettings = params.Attributes || {};
        const validSuppliedSettings = {};
        const validSettings = [
          'DelaySeconds',
          'MaximumMessageSize',
          'MessageRetentionPeriod',
          'Policy',
          'ReceiveMessageWaitTimeSeconds',
          'RedrivePolicy',
          'VisibilityTimeout'
        ];

        validSettings.forEach(setting => {
          if ({}.hasOwnProperty.call(suppliedSettings, setting)) {
            validSuppliedSettings[setting] = suppliedSettings[setting];
          }
        });

        const settings = {
          Name: params.QueueName,
          URL: queueUrl,
          ...defaultSettings,
          ...validSuppliedSettings
        };

        queues[queueUrl] = {
          queue: new Queue(queueUrl, {visibility: 30, delay: 0}),
          settings
        };
        return cb(null, {QueueUrl: queueUrl});
      };
    }

    return createRequest.call(this, formatRequest, parameters, callback);
  }

  deleteMessage(parameters, callback) {
    function formatRequest(params) {
      return cb => {
        const error = checkParams(params, ['QueueUrl', 'ReceiptHandle']);

        if (error) {
          return cb(error);
        }

        const {queue} = queues[params.QueueUrl];
        queue.ack(params.ReceiptHandle, err => {
          if (err) {
            return cb(err);
          }

          cb(null, {});
        });
      };
    }

    return createRequest.call(this, formatRequest, parameters, callback);
  }

  deleteMessageBatch(parameters, callback) {
    function formatRequest(params) {
      return cb => {
        const error = checkParams(params, ['QueueUrl', 'Entries']);

        if (error) {
          return cb(error);
        }

        connectToQueue(params.QueueUrl, (err, res) => {
          if (err) {
            return cb(err);
          }

          const queue = res.queue;

          // async.map(
          //   params.Entries,
          //   (entry, mapCb) => {
          //     queue.ack(entry.ReceiptHandle, err => {
          //       if (err) {
          //         // debug(err);
          //         return mapCb(null, {
          //           successful: false,
          //           Id: entry.Id,
          //           SenderFault: false,
          //           Code: err.code || 'UnknownError'
          //         });
          //       }

          //       mapCb(null, {successful: true, Id: entry.Id});
          //     });
          //   },
          //   (err, results) => {
          //     if (err) {
          //       return cb(err);
          //     }

          //     const formattedResults = {Successful: [], Failed: []};

          //     results.forEach(result => {
          //       if (result.successful) {
          //         delete result.successful;
          //         formattedResults.Successful.push(result);
          //       } else {
          //         delete result.successful;
          //         formattedResults.Failed.push(result);
          //       }
          //     });

          //     cb(null, formattedResults);
          //   }
          // );
        });
      };
    }

    return createRequest.call(this, formatRequest, parameters, callback);
  }

  deleteQueue(parameters, callback) {
    function formatRequest(params) {
      return cb => {
        const error = checkParams(params, ['QueueUrl']);

        if (error) {
          return cb(error);
        }
        cb(null, {});
      };
    }

    return createRequest.call(this, formatRequest, parameters, callback);
  }

  getQueueAttributes(params, callback) {
    return [this, params, callback];
    // TODO: fix params
  }

  getQueueUrl(parameters: any, callback: any) {
    function formatRequest(params: any) {
      return (cb: Function) => {
        const error = checkParams(params, ['QueueName']);

        if (error) {
          return cb(error);
        }

        // connect((err, db) => {
        //   if (err) {
        //     return cb(err);
        //   }

        //   db.collection('queue_settings').findOne(
        //     {Name: params.QueueName},
        //     (err, queueObject) => {
        // queueObject {
        //   "_id":"5d89bceb5e340127684c654d",
        //   "Name":"test_queue",
        //   "URL":"https://example.com/1234/test_queue",
        //   "Created":"2019-09-24T06:51:23.769Z",
        //   "DelaySeconds":0,
        //   "MaxMessageSize":0,
        //   "MessageRetentionPeriod":0,
        //   "ReceiveMessageWaitTimeSeconds":0,
        //   "VisibilityTimeout":0
        // }
        //       if (err) {
        //         return cb(err);
        //       }

        //       if (!queueObject) {
        //         return cb(new awsErrors.QueueDoesNotExistError());
        //       }
        cb(null, {QueueUrl: `http://localhost/${params.QueueName}`});
        //     }
        //   );
        // });
      };
    }

    return createRequest.call(this, formatRequest, parameters, callback);
  }

  listDeadLetterSourceQueues(params, callback) {
    return [this, params, callback];
    // TODO: fix params
  }

  listQueues(parameters, callback) {
    function formatRequest(params) {
      return cb => {
        const query = {};
        const collections = [];

        if (params.QueueNamePrefix) {
          (query as any).Name = new RegExp(`^${params.QueueNamePrefix}`);
        }

        const filterList = ['system.indexes', 'queue_settings'];
        const validCollections = collections
          .filter(collection => filterList.indexOf(collection.Name) < 0)
          .map(collection => collection.URL);

        cb(null, {QueueUrls: validCollections});
      };
    }

    return createRequest.call(this, formatRequest, parameters, callback);
  }

  purgeQueue(params, callback) {
    return [this, params, callback];
    // TODO: fix params
  }

  receiveMessage(parameters: any, callback: Function) {
    function formatRequest(params) {
      return cb => {
        const error = checkParams(params, ['QueueUrl']);

        if (error) {
          return cb(error);
        }

        if (params.WaitTimeSeconds) {
          const time = parseInt(params.WaitTimeSeconds, 10)
            ? params.WaitTimeSeconds
            : 0;
          return setTimeout(() => doReceiveMessage(params, cb), time * 1000);
        }

        doReceiveMessage(params, cb);
      };
    }

    return createRequest.call(this, formatRequest, parameters, callback);
  }

  removePermission(params, callback) {
    return [this, params, callback];
    // TODO: fix params
  }

  sendMessage(parameters, callback) {
    const formatRequest = params => {
      return (cb: Function) => {
        const error = checkParams(params, ['MessageBody', 'QueueUrl']);

        if (error) {
          return cb(error);
        }

        // if queue exists
        let queue: Queue;
        if (params.QueueUrl in queues) {
          queue = queues[params.QueueUrl];

          queue.add(
            params.MessageBody,
            {delay: params.DelaySeconds || 0},
            (addErr, id) => {
              if (addErr) {
                return cb(addErr);
              }
              const response = {
                MD5OfMessageBody: params.MessageBody,
                MessageId: id
              };
              cb(null, response);
            }
          );
        } else {
          this.createQueue(
            {
              QueueName:
                params.QueueUrl || JSON.parse(params.MessageBody).queueName
            },
            () => {
              const {queue} = queues[params.QueueUrl];
              queue.add(
                params.MessageBody,
                {delay: params.DelaySeconds || 0},
                (addErr, id) => {
                  if (addErr) {
                    return cb(addErr);
                  }
                  const response = {
                    MD5OfMessageBody: params.MessageBody,
                    MessageId: id
                  };
                  cb(null, response);
                }
              );
            }
          );
        }
      };
    };

    return createRequest.call(this, formatRequest, parameters, callback);
  }

  sendMessageBatch(params, callback: Function) {
    return [this, params, callback];
    // TODO: fix params
  }

  setQueueAttributes(parameters, callback: Function) {
    function formatRequest(params) {
      return cb => {
        const error = checkParams(params, ['QueueUrl', 'Attributes']);

        if (error) {
          return cb(error);
        }

        const validAttributes = [
          'DelaySeconds',
          'MaximumMessageSize',
          'MessageRetentionPeriod',
          'ReceiveMessageWaitTimeSeconds',
          'VisibilityTimeout'
        ];

        const setOperations = {};

        validAttributes.forEach(attribute => {
          if (params.Attributes[attribute]) {
            setOperations[attribute] = params.Attributes[attribute];
          }
        });

        // db.collection('queue_settings').findOneAndUpdate(
        //   {URL: params.QueueUrl},
        //   {$set: setOperations},
        //   err => {
        //     if (err) {
        //       return cb(err);
        //     }
        cb(null, undefined);
        // }
        // );
      };
    }

    return createRequest.call(this, formatRequest, parameters, callback);
  }
}

function checkParams(params, reqParams) {
  const missingParams = [];

  reqParams.forEach(reqParam => {
    if (params[reqParam] === null || params[reqParam] === undefined) {
      missingParams.push(reqParam);
    }
  });

  if (missingParams.length) {
    const errors = missingParams.map(
      param => new awsErrors.MissingRequiredParameterError(param)
    );

    if (missingParams.length === 1) {
      return errors[0];
    }

    return new awsErrors.MultipleValidationErrors(errors);
  }
}

function normalize(params, callback) {
  if (typeof callback !== 'function') {
    if (!params) {
      // debug("No parameters, no callback");
      return {params: this.config.params || {}, callback: null};
    }

    if (typeof params === 'function') {
      // debug("Callback, no parameters");
      return {params: this.config.params || {}, callback: params};
    }

    // debug("Parameters, no callback");
    return {
      params: Object.assign({}, this.config.params, params),
      callback: null
    };
  }

  // debug("Parameters, callback");
  return {params: Object.assign({}, this.config.params, params), callback};
}

function createRequest(formatRequest, params, callback) {
  const normalizedArgs = normalize.call(this, params, callback);
  return new Request(
    formatRequest(normalizedArgs.params),
    normalizedArgs.callback
  );
}

function connectToQueue(queueUrl, callback) {
  if (!queueUrl) {
    return callback(new Error('QueueUrl required'));
  }

  if (queues[queueUrl]) {
    const queueObj = queues[queueUrl];
    return callback(null, queueObj);
  }

  // const settings = {
  //   Name: queueUrl.split('/').pop(),
  //   URL: queueUrl,
  //   Created: new Date().toISOString(),
  //   DelaySeconds: 0,
  //   MaximumMessageSize: 262144,
  //   MessageRetentionPeriod: 345600,
  //   ReceiveMessageWaitTimeSeconds: 0,
  //   VisibilityTimeout: 30
  // };

  // queues[queueUrl] = {
  //   queue: new Queue(queueUrl, {visibility: 30, delay: 0}),
  //   settings
  // };
  callback(null, queues[queueUrl]);
}

function doReceiveMessage(params: any, callback: Function) {
  const {queue, settings} = queues[params.QueueUrl];

  const visibility = params.VisibilityTimeout || settings.VisibilityTimeout;

  queue.get({visibility}, (err, record) => {
    if (err) {
      return sendResponse(err, null, callback);
    }
    if (!record) {
      return sendResponse(null, {}, callback);
    }

    const formattedRecord = {
      MessageId: record.id,
      ReceiptHandle: record.ack,
      // MD5OfBody: md5(JSON.stringify(record.payload)),
      Body: record.payload,
      Attributes: {
        SentTimestamp: getTimestamp(record.id)
          .getTime()
          .toString(),
        ApproximateReceiveCount: record.tries.toString(),
        ApproximateFirstReceiveCount: (
          new Date(record.firstClaimed).getTime() * 1000
        ).toString()
      }
    };

    sendResponse(null, {Messages: [formattedRecord]}, callback);
  });
}

function sendResponse(err, data, callback) {
  if (callback && typeof callback === 'function') {
    // debug("Callback supplied in function call");
    return callback(err, data);
  }

  // debug("No callback supplied in function call, returning request object");
  return {
    promise() {
      if (err) {
        return Promise.reject(err);
      }
      return Promise.resolve(data);
    }
  };
}

function getTimestamp(objectId) {
  return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
}
