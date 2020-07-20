import { QueueService } from '@hindawi/queue-service';

import { PublishMessage } from './PublishMessage';

export abstract class AbstractSQSClient {
  constructor(protected queueService: QueueService, private foo = 666) {}

  public async publish<T>(message: PublishMessage): Promise<T> {
    return this.queueService.publish(message);
  }

  public async testConnection(): Promise<unknown> {
    const res = await this.queueService.publishMessage({
      event: 'test',
      data: { connected: true },
    });

    return res;
  }
}
