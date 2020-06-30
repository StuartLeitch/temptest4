import { EventMappingPolicyContract } from '../contracts/EventMappingPolicy';
import { REPORTING_TABLES, SYNDICATION_EVENTS } from '../constants';

export class SyndicationMappingPolicy implements EventMappingPolicyContract {
  getTable(): REPORTING_TABLES {
    return REPORTING_TABLES.SYNDICATION;
  }
  includesEvent(eventName: string): boolean {
    return SYNDICATION_EVENTS.includes(eventName);
  }
}
