import {ConfigContract} from '../../../../../infrastructure/message-queues/contracts/Config';

export class RabbitMqQueueConfig extends ConfigContract {
  host: string = 'localhost';
  port: number = 5762;
  username: string = null;
  password: string = null;
}
