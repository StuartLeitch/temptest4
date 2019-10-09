import {ConfigContract} from '../../../../../infrastructure/message-queues/contracts/Config';

export class RabbitMqQueueConfig extends ConfigContract {
  host = 'localhost';
  port = 5762;
  username: string = null;
  password: string = null;
}
