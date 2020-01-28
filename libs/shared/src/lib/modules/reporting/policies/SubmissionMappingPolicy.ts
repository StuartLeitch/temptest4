import { EventMappingPolicyContract } from '../contracts/EventMappingPolicy';
import { REPORTING_TABLES } from '../constants';

export class SubmissionMappingPolicy implements EventMappingPolicyContract {
  getTable(): REPORTING_TABLES {
    return REPORTING_TABLES.SUBMISSION;
  }
  includesEvent(eventName: string): boolean {
    return eventName.startsWith('Submission');
  }
}
