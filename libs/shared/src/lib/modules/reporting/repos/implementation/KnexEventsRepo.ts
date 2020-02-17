import Knex from 'knex';

import { AbstractBaseDBRepo } from 'libs/shared/src/lib/infrastructure/AbstractBaseDBRepo';
import { Event } from '../../domain/Event';
import { EventsRepoContract } from '../EventsRepo';

export class KnexEventsRepo extends AbstractBaseDBRepo<Knex, Event>
  implements EventsRepoContract {
  async upsertEvents(table: string, events: Event[]): Promise<number> {
    if (events.length === 0) {
      return;
    }
    const updateQuery = [
      'INSERT INTO ?? (id, time, type, payload) VALUES',
      events.map(() => '(?, to_timestamp(?), ?, ?)').join(','),
      'ON CONFLICT (id) DO UPDATE SET time = EXCLUDED.time, type = EXCLUDED.type, payload = EXCLUDED.payload'
    ].join(' ');

    const values = [table];
    events.forEach(ev => {
      values.push(
        ...[
          ev.id.toString(),
          (ev.time.getTime() / 1000) as any,
          ev.type,
          ev.payload
        ]
      );
    });

    return this.db.raw(updateQuery, values);
  }
  exists(e: Event): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  save(e: Event): Promise<Event> {
    throw new Error('Method not implemented.');
  }
}
