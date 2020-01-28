import { REPORTING_TABLES } from '../constants';
import { EventDTO } from '../domain/EventDTO';
import { EventMappingPolicyContract } from './EventMappingPolicy';

export interface EventMappingRegistryContract {
  defaultPolicy: EventMappingPolicyContract;
  addPolicy(p: EventMappingPolicyContract): void;
  mapEvents(events: EventDTO[]): EventMappingResponse;
}

export type EventMappingResponse = EventMapping[];

export interface EventMapping {
  table: REPORTING_TABLES;
  events: EventDTO[];
}
