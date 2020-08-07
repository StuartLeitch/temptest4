/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

// import Knex from 'knex';
// import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';

import { Event } from '../../domain/Event';
import { EventsRepoContract } from '../EventsRepo';

export class MockEventsRepo implements EventsRepoContract {
  private eventMap = {};
  getEventMap(): any {
    return this.eventMap;
  }
  async getEvents(table: string): Promise<Event[]> {
    return this.eventMap[table] || [];
  }
  async upsertEvents(table: string, events: Event[]): Promise<number> {
    if (events.length === 0) {
      return;
    }

    if (!this.eventMap[table]) {
      this.eventMap[table] = [] as Event[];
    }

    this.eventMap[table].push(...events);

    return events.length;
  }
  async clear() {
    this.eventMap = {};
  }
  exists(e: Event): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  save(e: Event): Promise<Event> {
    throw new Error('Method not implemented.');
  }
}
