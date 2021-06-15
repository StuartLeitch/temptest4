import { Either, left } from '../../../../core/logic/Either';

import { RepoError } from '../../../../infrastructure/RepoError';

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
  async exists(e: Event): Promise<Either<RepoError, boolean>> {
    return left(RepoError.methodNotImplemented('MockEventsRepo.exists'));
  }
  async save(e: Event): Promise<Either<RepoError, Event>> {
    return left(RepoError.methodNotImplemented('MockEventsRepo.save'));
  }
}
