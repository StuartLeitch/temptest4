import { REPORTING_TABLES } from '../constants';

export interface EventMappingPolicyContract {
  getTable(): REPORTING_TABLES;
  includesEvent(eventName: string): boolean;
}
