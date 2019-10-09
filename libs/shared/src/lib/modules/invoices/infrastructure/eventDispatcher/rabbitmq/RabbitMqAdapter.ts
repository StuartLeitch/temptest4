import * as Rabbitjs from 'rabbit.js';

import {EncoderContract} from '../../../../../infrastructure/message-queues/contracts/Encoder';
import {ErrorHandlerContract} from '../../../../../infrastructure/message-queues/contracts/ErrorHandler';
import {JobContract} from '../../../../../infrastructure/message-queues/contracts/Job';

import {QueueAdapter} from '../QueueAdapter';
import {RabbitMqQueueConfig} from './RabbitMqConfig';
import {RabbitMqJob} from './RabbitMqJob';

export class RabbitMqAdapter extends QueueAdapter {
  protected config: RabbitMqQueueConfig;

  protected contextPromise: Promise<Rabbitjs.Context>;

  protected subscribeSocketPromise: Promise<Rabbitjs.SubSocket>;
  protected subscribeConnectionPromises: {
    [queueName: string]: Promise<Rabbitjs.WorkerSocket>;
  } = {};

  protected publishSocketPromise: Promise<Rabbitjs.SubSocket>;
  protected publishConnectionPromises: {
    [queueName: string]: Promise<Rabbitjs.PushSocket>;
  } = {};

  constructor(
    errorHandler: ErrorHandlerContract,
    encoder: EncoderContract,
    config: RabbitMqQueueConfig = new RabbitMqQueueConfig()
  ) {
    super(errorHandler, encoder, config);
  }

  public async produce(queueName: string, payload: any): Promise<void> {
    const publishSocket: Rabbitjs.PushSocket = await this.getPublishConnectionPromise(
      queueName
    );

    publishSocket.write(this.encoder.encode(payload), 'utf8');
  }

  public async consume(
    queueName: string,
    callback: (job: JobContract) => void
  ): Promise<void> /* Rabbitjs.WorkerSocket*/ {
    const subscribeSocket: Rabbitjs.WorkerSocket = await this.getSubscribeConnectionPromise(
      queueName
    );
    subscribeSocket.on('data', payload => {
      payload = this.encoder.decode(payload);

      const job = new RabbitMqJob(this.errorHandler, payload, subscribeSocket);
      callback(job);
    });

    // return subscribeSocket;
  }

  protected async getContextPromise(): Promise<Rabbitjs.Context> {
    if (!this.contextPromise) {
      const context = Rabbitjs.createContext(
        this.getConnectionString(this.config)
      );
      this.contextPromise = new Promise(
        function(resolve, reject) {
          context.on(
            'ready',
            function() {
              resolve(context);
            }.bind(context)
          );

          context.on('error', reject);
        }.bind(context)
      );
    }

    return this.contextPromise;
  }

  protected async getSubscribeSocketPromise(): Promise<Rabbitjs.SubSocket> {
    if (!this.subscribeSocketPromise) {
      const context: Rabbitjs.Context = await this.getContextPromise();
      this.subscribeSocketPromise = context.socket('WORKER', {
        persistent: true,
        prefetch: 1
      });
    }

    return this.subscribeSocketPromise;
  }

  // TODO: see how to enable specific concurrency for each queue consumption
  protected async getSubscribeConnectionPromise(queueName: string) {
    if (!this.subscribeConnectionPromises[queueName]) {
      const subscribeSocket: Rabbitjs.SubSocket = await this.getSubscribeSocketPromise();
      this.subscribeConnectionPromises[queueName] = new Promise(
        function(resolve) {
          subscribeSocket.connect(
            queueName,
            function() {
              subscribeSocket.setEncoding('utf8');

              resolve(subscribeSocket);
            }.bind(resolve)
          );
        }.bind(subscribeSocket)
      );
    }

    return this.subscribeConnectionPromises[queueName];
  }

  protected async getPublishSocketPromise(): Promise<Rabbitjs.SubSocket> {
    if (!this.publishSocketPromise) {
      const context: Rabbitjs.Context = await this.getContextPromise();
      this.publishSocketPromise = context.socket('PUSH', {persistent: true});
    }

    return this.publishSocketPromise;
  }

  protected async getPublishConnectionPromise(
    queueName: string
  ): Promise<Rabbitjs.PushSocket> {
    if (!this.publishConnectionPromises[queueName]) {
      const publishSocket: Rabbitjs.SubSocket = await this.getPublishSocketPromise();
      this.publishConnectionPromises[queueName] = new Promise(
        function(resolve) {
          publishSocket.connect(
            queueName,
            function() {
              resolve(publishSocket);
            }.bind(resolve)
          );
        }.bind(publishSocket)
      );
    }

    return this.publishConnectionPromises[queueName];
  }

  protected getConnectionString(config: RabbitMqQueueConfig) {
    let connectionString = 'amqp://';

    if (config.username && config.password) {
      connectionString += config.username + ':' + config.password + '@';
    }

    connectionString += config.host;

    if (config.port) {
      connectionString += ':' + config.port;
    }

    return connectionString;
  }
}
