import {ErrorHandlerContract} from '../../../../infrastructure/message-queues/contracts/ErrorHandler';
import {EncoderContract} from '../../../../infrastructure/message-queues/contracts/Encoder';

import {StdOutErrorHandler} from './StdOutErrorHandler';
import {JsonEncoder} from './JsonEncoder';
import {RabbitMqAdapter} from './rabbitmq/RabbitMqAdapter';

export class AdapterFactory {
  public create(
    name: string,
    config: any,
    errorhandler: ErrorHandlerContract = new StdOutErrorHandler(),
    encoder: EncoderContract = new JsonEncoder()
  ) {
    let adapter = null;
    switch (name) {
      case 'rabbitmq':
        adapter = new RabbitMqAdapter(errorhandler, encoder, config);
        break;
      default:
        throw new Error(name + ' is not a supported queue adapter');
    }

    return adapter;
  }
}
