import { EventMappingPolicyContract } from '../contracts/EventMappingPolicy';
import {
  REPORTING_TABLES,
  CHECKER_TEAM_EVENTS,
  CHECKER_SUBMISSION_EVENTS
} from '../constants';

export class CheckerMappingPolicy implements EventMappingPolicyContract {
  checkerEvents = [...CHECKER_TEAM_EVENTS, ...CHECKER_SUBMISSION_EVENTS];
  getTable(): REPORTING_TABLES {
    return REPORTING_TABLES.CHECKER;
  }
  includesEvent(eventName: string): boolean {
    return this.checkerEvents.includes(eventName);
  }
}
