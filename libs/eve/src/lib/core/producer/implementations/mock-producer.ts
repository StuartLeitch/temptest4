import { cloneDeep } from 'lodash';

import { MockEvent } from '../../../modules/event';
import { Selector } from '../../selector';
import { Producer } from '../producer';
import { Filter } from '../../filters';

export interface EventStoreObject {
  key: string;
  value: MockEvent;
}

export type EventsStore = EventStoreObject[];

export class MockProducer implements Producer<MockEvent, string> {
  private selectors: Selector<string>[];
  private filters: Filter<MockEvent>[];
  private baseObject: object;
  private events: EventsStore;

  constructor() {
    this.baseObject = {};
    this.selectors = [];
    this.filters = [];
    this.events = [];
  }

  from(events: EventsStore): void {
    this.events = events;
  }

  async *produce(): AsyncGenerator<MockEvent, void, undefined> {
    const objects: EventsStore = await Promise.resolve(this.events);
    for (const { key, value } of objects) {
      if (this.checkSelectors(key) && this.checkFilters(value)) {
        yield Object.assign(cloneDeep(this.baseObject), value);
      }
    }
  }

  setDefaultValues(base: object = {}): void {
    this.baseObject = cloneDeep(base);
  }

  addFilter(filter: Filter<MockEvent>): void {
    this.filters.push(filter);
  }

  removeFilters(): void {
    this.filters = [];
  }

  addSelector(selector: Selector<string>): void {
    this.selectors.push(selector);
  }

  removeSelectors(): void {
    this.selectors = [];
  }

  private checkFilters(event: MockEvent): boolean {
    for (const filter of this.filters) {
      if (!filter.match(event)) {
        return false;
      }
    }

    return true;
  }

  private checkSelectors(key: string): boolean {
    for (const selector of this.selectors) {
      if (!selector.shouldSelect(key)) {
        return false;
      }
    }

    return true;
  }
}
