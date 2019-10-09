import {MockJobCreatedEvent} from '../events/mockJobCreatedEvent';
import {MockJobDeletedEvent} from '../events/mockJobDeletedEvent';
import {HandleContract} from '../../../contracts/Handle';
import {DomainEvents} from '../../../DomainEvents';

export class MockPostToSocial
  implements
    HandleContract<MockJobCreatedEvent>,
    HandleContract<MockJobDeletedEvent> {
  /**
   * This is how we may setup subscriptions to domain events.
   */

  setupSubscriptions(): void {
    DomainEvents.register(this.handleJobCreatedEvent, MockJobCreatedEvent.name);
    DomainEvents.register(this.handleDeletedEvent, MockJobDeletedEvent.name);
  }

  /**
   * These are examples of how we define the handlers for domain events.
   */

  handleJobCreatedEvent(event: MockJobCreatedEvent): void {
    console.log('A job was created!!!');
  }

  handleDeletedEvent(event: MockJobDeletedEvent): void {
    console.log('A job was deleted!!!');
  }
}
