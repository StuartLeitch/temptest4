import { EventMappingPolicyContract } from '../contracts/EventMappingPolicy';
import { REPORTING_TABLES } from '../constants';
export class DefaultMappingPolicy implements EventMappingPolicyContract {
  getTable(): REPORTING_TABLES {
    return REPORTING_TABLES.DEFAULT;
  }
  includesEvent(eventName: string): boolean {
    return true;
  }
}
