import { cloneDeep } from 'lodash';

import { Event } from '../../event/event';
import { Producer } from '../producer';

export class MockProducer implements Producer<Event> {
  private baseObject: object = {};
  private events: Event[];

  produceFrom(events: Event[]): void {
    this.events = events;
  }

  async *getObjects(): AsyncGenerator<Event, void, undefined> {
    const newEvents: Event[] = await Promise.resolve(this.events);
    for (const event of newEvents) {
      yield Object.assign(cloneDeep(this.baseObject), event);
    }
  }

  setBaseObject(base: object = {}): void {
    this.baseObject = cloneDeep(base);
  }
}
