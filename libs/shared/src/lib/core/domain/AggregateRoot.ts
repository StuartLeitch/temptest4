import { DomainEventContract } from './events/contracts/DomainEvent';
import { DomainEvents } from './events/DomainEvents';
import { Entity } from './Entity';
import { UniqueEntityID } from './UniqueEntityID';

type CompareFunction = (a: DomainEventContract, b: DomainEventContract) => boolean;

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEventContract[] = [];

  get id(): UniqueEntityID {
    return this._id;
  }

  get domainEvents(): DomainEventContract[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEventContract): void {
    // Add the domain event to this aggregate's list of domain events
    this._domainEvents.push(domainEvent);
    // Add this aggregate instance to the domain event's list of aggregates who's
    // events it eventually needs to dispatch.
    DomainEvents.markAggregateForDispatch(this);
    // Log the domain event
    this.logDomainEventAdded(domainEvent);
  }

  /**
   * Check if an event already was generated, based on a comparison function
   * @param toCheck event for which existence will be checked
   * @param compareFn comparison function for the existence check
   * @returns true of false if the event exists, matching the compare function
   */
  protected domainEventExists(toCheck: DomainEventContract, compareFn: CompareFunction): boolean {
    const index = this._domainEvents.findIndex(event => compareFn(event, toCheck))

    return index > -1;
  }

  public clearEvents(): void {
    this._domainEvents.splice(0, this._domainEvents.length);
  }

  private logDomainEventAdded(domainEvent: DomainEventContract): void {
    const thisClass = Reflect.getPrototypeOf(this);
    const domainEventClass = Reflect.getPrototypeOf(domainEvent);

    // tslint:disable-next-line:no-console
    // console.info(
    //   `[Domain Event Created]:`,
    //   thisClass.constructor.name,
    //   '==>',
    //   domainEventClass.constructor.name
    // );
  }
}
