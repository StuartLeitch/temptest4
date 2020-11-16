import { PublishMessage } from './sqs/PublishMessage';

export interface SQSPublishServiceContract {
  [x: string]: any;
  publishMessage(message: PublishMessage): Promise<void>;
}

export class MockSqsPublishService implements SQSPublishServiceContract {
  messages: PublishMessage[] = [];

  async publishMessage(message: PublishMessage): Promise<void> {
    this.messages.push(message);
  }

  findEvent(eventName: string): PublishMessage {
    return this.messages.find((msg) => msg.event === eventName);
  }

  filterEvents(eventName: string): PublishMessage[] {
    return this.messages.filter((msg) => msg.event == eventName);
  }
}
