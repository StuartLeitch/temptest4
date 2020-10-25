import { EventMappingPolicyContract } from '../contracts/EventMappingPolicy';
import { ARTICLE_PUBLISHED_EVENTS, REPORTING_TABLES } from '../constants';

export class ArticleMappingPolicy implements EventMappingPolicyContract {
  getTable(): REPORTING_TABLES {
    return REPORTING_TABLES.ARTICLE;
  }
  includesEvent(eventName: string): boolean {
    return ARTICLE_PUBLISHED_EVENTS.includes(eventName);
  }
}
