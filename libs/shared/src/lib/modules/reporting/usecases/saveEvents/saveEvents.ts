// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { right, left } from '../../../../core/logic/Result';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { EventMap } from '../../mappers/EventMap';
import { EventsRepoContract } from '../../repos/EventsRepo';

import { SaveEventsDTO } from './saveEventsDTO';
import { SaveEventsResponse } from './saveEventsResponse';
import { EventMappingRegistryContract } from '../../contracts/EventMappingRegistry';

export class SaveEventsUsecase
  implements
    UseCase<
      SaveEventsDTO,
      Promise<SaveEventsResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      SaveEventsDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  authorizationContext: UsecaseAuthorizationContext;

  constructor(
    private eventsRepo: EventsRepoContract,
    private policyRegistry: EventMappingRegistryContract
  ) {
    this.authorizationContext = { roles: [] };
  }

  public async execute(
    request: SaveEventsDTO,
    context?: UsecaseAuthorizationContext & { totalLimitPerTable: number , mapCount: object}
  ): Promise<SaveEventsResponse> {

    try {
      if (request.events.length === 0) {
        console.log('No events to save');
        return right(null);
      }

      // console.info(context);
      const { mapCount, totalLimitPerTable } = context;

      await Promise.all(
        this.policyRegistry.mapEvents(request.events).map((mapping) => {

          const persistenceEvents = mapping.events.map((raw) => {
            return EventMap.toDomain({
              id: raw.id,
              time: raw.timestamp,
              type: raw.event,
              payload: JSON.stringify(raw.data),
            });
          });

          if (mapCount[mapping.table] < totalLimitPerTable) {
            mapCount[mapping.table] += persistenceEvents.length;
            return [];
            // return this.eventsRepo.upsertEvents(mapping.table, persistenceEvents);
          }
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
