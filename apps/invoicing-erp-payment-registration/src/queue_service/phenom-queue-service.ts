import { SQSPublishServiceContract } from '@hindawi/shared';

import { EventHandler } from './event-handler';

export interface PhenomSqsServiceContract extends SQSPublishServiceContract {
  registerEventHandler(handler: EventHandler<unknown>): void;
  start(): void;
}
