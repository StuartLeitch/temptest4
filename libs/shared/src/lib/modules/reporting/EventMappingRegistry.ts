import { REPORTING_TABLES } from './constants';
import { EventMappingPolicyContract } from './contracts/EventMappingPolicy';
import {
  EventMappingRegistryContract,
  EventMappingResponse
} from './contracts/EventMappingRegistry';
import { EventDTO } from './domain/EventDTO';
import { DefaultMappingPolicy } from './policies/DefaultMappingPolicy';

export class EventMappingRegistry implements EventMappingRegistryContract {
  private policies: EventMappingPolicyContract[] = [];
  defaultPolicy: EventMappingPolicyContract = new DefaultMappingPolicy();

  mapEvents(events: EventDTO[]): EventMappingResponse {
    const eventMapping = {};

    events.forEach((event: EventDTO) => {
      let policy = this.policies.find(p => p.includesEvent(event.event));
      if (!policy) {
        policy = this.defaultPolicy;
      }
      const table = policy.getTable();

      if (!eventMapping[table]) {
        eventMapping[table] = [];
      }
      eventMapping[table].push(event);
    });

    const response: EventMappingResponse = [];
    for (let table in eventMapping) {
      response.push({
        table: table as REPORTING_TABLES,
        events: eventMapping[table]
      });
    }
    return response;
  }

  addPolicy(p: EventMappingPolicyContract): void {
    this.policies.push(p);
  }
}
