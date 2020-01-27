// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { right, left } from '../../../../core/logic/Result';

import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import {
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import { Roles } from '../../../users/domain/enums/Roles';
import { EventMap } from '../../mappers/EventMap';
import { EventsRepoContract } from '../../repos/EventsRepo';

import { SaveEventsDTO } from './SaveEventsDTO';
import { SaveEventsResponse } from './saveEventsResponse';
import { EventMappingRegistryContract } from '../../contracts/EventMappingRegistry';

export type SaveEventsContext = AuthorizationContext<Roles>;

export class SaveEventsUsecase
  implements
    UseCase<SaveEventsDTO, Promise<SaveEventsResponse>, SaveEventsContext>,
    AccessControlledUsecase<
      SaveEventsDTO,
      SaveEventsContext,
      AccessControlContext
    > {
  authorizationContext: AuthorizationContext<Roles>;

  constructor(
    private eventsRepo: EventsRepoContract,
    private policyRegistry: EventMappingRegistryContract
  ) {
    this.authorizationContext = { roles: [] };
  }

  public async execute(
    request: SaveEventsDTO,
    context?: SaveEventsContext
  ): Promise<SaveEventsResponse> {
    try {
      if (request.events.length === 0) {
        console.log('No events to save');
        return right(null);
      }
      await this.policyRegistry.mapEvents(request.events).map(mapping => {
        const persistenceEvents = mapping.events.map(raw => {
          return EventMap.toDomain({
            id: raw.id,
            time: new Date(),
            type: raw.event,
            payload: JSON.stringify(raw.data)
          });
        });
        this.eventsRepo.upsertEvents(mapping.table, persistenceEvents);
      });
    } catch (error) {
      console.log(error.message);
      console.log(
        'Failed to save events',
        request.events.map(e => ({ id: e.id, event: e.event }))
      );
      return left(error);
    }
    return right(null);
  }
}
