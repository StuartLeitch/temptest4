import { Consumer } from '../consumer';
import { MockEvent } from '../../../modules/event';
export declare class MockConsumer implements Consumer<MockEvent> {
    private _output;
    get output(): MockEvent[];
    consume(objects: MockEvent[] | MockEvent): void;
}
