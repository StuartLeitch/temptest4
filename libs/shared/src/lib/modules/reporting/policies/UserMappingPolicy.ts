import { EventMappingPolicyContract } from '../contracts/EventMappingPolicy';
import { REPORTING_TABLES } from '../constants';

export class UserMappingPolicy implements EventMappingPolicyContract {
  getTable(): REPORTING_TABLES {
    return REPORTING_TABLES.USER;
  }
  includesEvent(eventName: string): boolean {
    return eventName.startsWith('User');
  }
}
