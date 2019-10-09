import {QueueAdapterContract} from '../../../../infrastructure/message-queues/contracts/QueueAdapter';
import {ErrorHandlerContract} from '../../../../infrastructure/message-queues/contracts/ErrorHandler';
import {ConfigContract} from '../../../../infrastructure/message-queues/contracts/Config';
import {EncoderContract} from '../../../../infrastructure/message-queues/contracts/Encoder';
import {JobContract} from '../../../../infrastructure/message-queues/contracts/Job';

export class QueueAdapter implements QueueAdapterContract {
  protected errorHandler: ErrorHandlerContract;
  protected encoder: EncoderContract;
  protected config: ConfigContract;
  protected consumedQueues: {[queueName: string]: {}};
  protected producedQueues: {[queueName: string]: {}};

  constructor(
    errorHandler: ErrorHandlerContract,
    encoder: EncoderContract,
    config: ConfigContract
  ) {
    this.errorHandler = errorHandler;
    this.encoder = encoder;
    this.config = config;
  }

  async consume(queueName: string, callback: (job: JobContract) => void) {
    if (this.consumedQueues[queueName]) {
      // throw OnlyOneConsumerPerQueueError();
    }

    this.consumedQueues[queueName] = {};
  }

  async produce(queueName: string, payload: any): Promise<void> {
    if (this.producedQueues[queueName]) {
      throw Error();
    }

    this.producedQueues[queueName] = {};
  }
}
