import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
import { Event } from '../domain/Event';

export interface EventPersistenceDTO {
  id: string;
  time: Date;
  type: string;
  payload: string;
}

export class EventMap extends Mapper<Event> {
  public static toDomain(raw: EventPersistenceDTO): Event {
    return Event.create(
      { ...raw, time: new Date(raw.time) },
      new UniqueEntityID(raw.id)
    ).getValue();
  }

  public static toPersistence(event: Event): EventPersistenceDTO {
    return {
      id: event.id.toString(),
      time: event.time,
      type: event.type,
      payload: event.payload
    };
  }
}
