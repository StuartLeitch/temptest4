import { MockEvent } from '../../../modules/event';
import { Selector } from '../../selector';
import { Producer } from '../producer';
import { Filter } from '../../filters';
export interface EventStoreObject {
    key: string;
    value: MockEvent;
}
export declare type EventsStore = EventStoreObject[];
export declare class MockProducer implements Producer<MockEvent, string> {
    private selectors;
    private filters;
    private baseObject;
    private events;
    constructor();
    from(events: EventsStore): void;
    produce(): AsyncGenerator<MockEvent, void, undefined>;
    setDefaultValues(base?: object): void;
    addFilter(filter: Filter<MockEvent>): void;
    removeFilters(): void;
    addSelector(selector: Selector<string>): void;
    removeSelectors(): void;
    private checkFilters;
    private checkSelectors;
}
