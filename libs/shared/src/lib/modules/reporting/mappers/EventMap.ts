import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { Mapper } from '../../../infrastructure/Mapper';

import { Event } from '../domain/Event';

export interface EventPersistenceDTO {
  id: string;
  time: Date;
  type: string;
  payload: string;
}

export class EventMap extends Mapper<Event> {
  public static toDomain(
    raw: EventPersistenceDTO
  ): Either<GuardFailure, Event> {
    return Event.create(
      { ...raw, time: raw.time ? new Date(raw.time) : null },
      new UniqueEntityID(raw.id)
    );
  }

  public static toPersistence(event: Event): EventPersistenceDTO {
    return {
      id: event.id.toString(),
      time: event.time,
      type: event.type,
      payload: event.payload,
    };
  }
}
