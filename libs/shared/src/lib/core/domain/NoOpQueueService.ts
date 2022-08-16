import { PhenomSqsServiceContract } from '../../../../../../apps/invoicing-graphql/src/queue_service/phenom-queue-service';

export class NoOpQueueService implements PhenomSqsServiceContract {
  public publishMessage(): Promise<void> {
    return null;
  }

  public registerEventHandler(): void {
    return null;
  }

  public start(): void {
    return null;
  }
}
