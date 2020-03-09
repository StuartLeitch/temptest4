import { EventMappingPolicyContract } from '../contracts/EventMappingPolicy';
import { REPORTING_TABLES } from '../constants';

export class CheckerMappingPolicy implements EventMappingPolicyContract {
  checkerEvents = [
    'CheckerTeamCreated',
    'CheckerTeamUpdated',
    'ScreenerAssigned',
    'ScreenerReassigned',
    'QualityCheckerAssigned',
    'QualityCheckerReassigned'
  ];
  getTable(): REPORTING_TABLES {
    return REPORTING_TABLES.CHECKER;
  }
  includesEvent(eventName: string): boolean {
    return this.checkerEvents.includes(eventName);
  }
}
