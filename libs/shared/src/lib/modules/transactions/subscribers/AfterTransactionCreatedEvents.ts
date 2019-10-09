import {HandleContract} from '../../../core/domain/events/contracts/Handle';
import {DomainEvents} from '../../../core/domain/events/DomainEvents';
import {TransactionCreatedEvent} from '../domain/events/transactionCreatedEvent';

export class AfterTransactionCreatedEvent
  implements HandleContract<TransactionCreatedEvent> {
  constructor() {
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
  ): Promise<any> {
    // Get metadata about the transaction from a metadata service and
    // make amendments to the transaction.
  }
}
