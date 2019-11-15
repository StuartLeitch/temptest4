import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { Roles } from './../../../modules/users/domain/enums/Roles';

import { CreateManuscriptUsecase } from './../../manuscripts/usecases/createManuscript/createManuscript';
import { CreateManuscriptAuthorizationContext } from './../../manuscripts/usecases/createManuscript/createManuscriptAuthorizationContext';

import { TransactionCreatedEvent } from '../domain/events/transactionCreatedEvent';

const defaultContext: CreateManuscriptAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN]
};

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
      // await this.createManuscript.execute({}, defaultContext);
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
