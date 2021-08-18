// * Core Domain
import { flatten, right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

import { EventMappingRegistryContract } from '../../contracts/EventMappingRegistry';

import { EventMap } from '../../mappers/EventMap';

import { EventsRepoContract } from '../../repos/EventsRepo';

import { SaveEventsResponse as Response } from './saveEventsResponse';
import { SaveEventsDTO as DTO } from './saveEventsDTO';

export class SaveEventsUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  authorizationContext: Context;

  constructor(
    private eventsRepo: EventsRepoContract,
    private policyRegistry: EventMappingRegistryContract
  ) {
    this.authorizationContext = { roles: [] };
  }

  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      if (request.events.length === 0) {
        console.log('No events to save');
        return right(null);
      }
      await Promise.all(
        this.policyRegistry.mapEvents(request.events).map((mapping) => {
          const persistenceEvents = flatten(
            mapping.events.map((raw) => {
              return EventMap.toDomain({
                id: raw.id,
                time: raw.timestamp,
                type: raw.event,
                payload: JSON.stringify(raw.data),
              });
            })
          );

          if (persistenceEvents.isLeft()) {
            return Promise.reject(persistenceEvents.value);
          }

          return this.eventsRepo.upsertEvents(
            mapping.table,
            persistenceEvents.value
          );
        })
      );
    } catch (error) {
      console.log(error.message);
      console.log(
        'Failed to save events',
        request.events.map((e) => ({ id: e.id, event: e.event }))
      );
      return left(error);
    }
    return right(null);
  }
}
