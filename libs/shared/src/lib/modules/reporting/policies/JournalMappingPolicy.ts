import { EventMappingPolicyContract } from '../contracts/EventMappingPolicy';
import { REPORTING_TABLES, JOURNAL_EVENTS } from '../constants';

export class JournalMappingPolicy implements EventMappingPolicyContract {
  getTable(): REPORTING_TABLES {
    return REPORTING_TABLES.JOURNAL;
  }
  includesEvent(eventName: string): boolean {
    return JOURNAL_EVENTS.includes(eventName);
  }
}
