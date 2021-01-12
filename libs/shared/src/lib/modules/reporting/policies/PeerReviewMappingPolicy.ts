import { EventMappingPolicyContract } from '../contracts/EventMappingPolicy';
import { PEER_REVIEW_EVENTS, REPORTING_TABLES } from '../constants';

export class PeerReviewMappingPolicy implements EventMappingPolicyContract {
  getTable(): REPORTING_TABLES {
    return REPORTING_TABLES.PEER_REVIEW;
  }
  includesEvent(eventName: string): boolean {
    return PEER_REVIEW_EVENTS.includes(eventName);
  }
}
