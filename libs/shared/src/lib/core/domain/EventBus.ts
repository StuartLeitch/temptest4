import {DomainEventContract} from './events/contracts/DomainEvent';
import {EventPublisherContract} from './events/contracts/EventPublisher';
import {CommandBusContract} from './commands/contracts/CommandBus';
import {EventBusContract} from './events/contracts/EventBus';

export class EventBus implements EventBusContract {
  private _publisher: EventPublisherContract;
  private readonly subscriptions: any[];

  constructor(private readonly commandBus: CommandBusContract) {
    this.subscriptions = [];
    // this.useDefaultPublisher();
  }

  publish<T extends DomainEventContract>(event: T) {
    this._publisher.publish(event);
  }

  publishAll(events: DomainEventContract[]) {
    (events || []).forEach(event => this._publisher.publish(event));
  }
}
