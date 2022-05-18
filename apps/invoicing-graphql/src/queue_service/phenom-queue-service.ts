import { SQSPublishServiceContract } from '@hindawi/shared';

import { HandlerFunction } from './event-handler';

interface QueueEventHandler<T> {
  handler: HandlerFunction<T>;
  event: string;
}

export interface PhenomSqsServiceContract extends SQSPublishServiceContract {
  registerEventHandler(handler: QueueEventHandler<unknown>): void;
  start(): void;
}
