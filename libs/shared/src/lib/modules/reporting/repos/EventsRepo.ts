import { Repo } from '../../../infrastructure/Repo';
import { Event } from '../domain/Event';

export interface EventsRepoContract extends Repo<Event> {
  upsertEvents(table: string, events: Event[]): Promise<number>;
}
