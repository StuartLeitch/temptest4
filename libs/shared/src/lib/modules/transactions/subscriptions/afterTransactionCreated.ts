import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';

import { CreateManuscriptUsecase } from './../../manuscripts/usecases/createManuscript/createManuscript';

import { TransactionCreatedEvent } from '../domain/events/transactionCreatedEvent';

export class AfterTransactionCreated
  implements HandleContract<TransactionCreatedEvent> {
  constructor(private createManuscript: CreateManuscriptUsecase) {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.onTransactionCreatedEvent.bind(this),
      TransactionCreatedEvent.name
    );
  }

  private async onTransactionCreatedEvent(
    event: TransactionCreatedEvent
  ): Promise<void> {
    const { transactionId } = event;
    try {
      console.log(
        `[AfterTransactionCreated]: Successfully executed CreateManuscript use case AfterTransactionCreated.`
      );
    } catch (err) {
      console.log(
        `[AfterTransactionCreated]: Failed to execute CreateManuscript use case AfterTransactionCreated.`
      );
    }
  }
}
