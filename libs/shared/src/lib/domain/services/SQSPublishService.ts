import { PublishMessage } from './sqs/PublishMessage';

export interface SQSPublishServiceContract {
  [x: string]: any;
  publishMessage(message: PublishMessage): Promise<void>;
}
