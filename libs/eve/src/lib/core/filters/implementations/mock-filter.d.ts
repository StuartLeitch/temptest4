import { Filter } from '../filter';
import { MockEvent } from '../../../modules/event';
export declare class MockFilter implements Filter<MockEvent> {
    private validIds;
    constructor(validIds?: string[]);
    match(event: MockEvent): boolean;
}
