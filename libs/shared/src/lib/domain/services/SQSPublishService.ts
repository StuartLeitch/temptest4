import {PublishMessage} from './sqs/PublishMessage';

export interface SQSPublishServiceContract {
  publishMessage(message: PublishMessage): Promise<void>;
}
