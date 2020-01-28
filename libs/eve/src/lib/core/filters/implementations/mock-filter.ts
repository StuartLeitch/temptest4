import { Filter } from '../filter';
import { MockEvent } from '../../../modules/event';

export class MockFilter implements Filter<MockEvent> {
  private validIds: string[];

  constructor(validIds: string[] = []) {
    this.validIds = validIds;
  }

  match(event: MockEvent): boolean {
    if (this.validIds.includes(event.messageId)) {
      return true;
    }
    return false;
  }
}
