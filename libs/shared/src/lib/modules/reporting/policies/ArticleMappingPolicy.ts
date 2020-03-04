import { EventMappingPolicyContract } from '../contracts/EventMappingPolicy';
import { REPORTING_TABLES } from '../constants';

export class ArticleMappingPolicy implements EventMappingPolicyContract {
  getTable(): REPORTING_TABLES {
    return REPORTING_TABLES.ARTICLE;
  }
  includesEvent(eventName: string): boolean {
    return eventName.startsWith('Article');
  }
}
