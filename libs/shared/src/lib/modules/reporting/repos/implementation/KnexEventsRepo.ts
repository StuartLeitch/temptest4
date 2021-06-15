import Knex from 'knex';

import { Either, left } from '../../../../core/logic/Either';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError } from '../../../../infrastructure/RepoError';

import { Event } from '../../domain/Event';

import { EventsRepoContract } from '../EventsRepo';

export class KnexEventsRepo
  extends AbstractBaseDBRepo<Knex, Event>
  implements EventsRepoContract {
  async upsertEvents(table: string, events: Event[]): Promise<number> {
    if (events.length === 0) {
      return;
    }
    const updateQuery = [
      'INSERT INTO ?? (id, time, type, payload) VALUES',
      events.map(() => '(?, to_timestamp(?), ?, ?)').join(','),
      'ON CONFLICT (id) DO UPDATE SET time = EXCLUDED.time, type = EXCLUDED.type, payload = EXCLUDED.payload',
    ].join(' ');

    const values = [table];
    events.forEach((ev) => {
      values.push(
        ...[
          ev.id.toString(),
          ev.time ? ((ev.time.getTime() / 1000) as any) : null,
          ev.type,
          ev.payload,
        ]
      );
    });

    return this.db.raw(updateQuery, values);
  }
  async exists(e: Event): Promise<Either<RepoError, boolean>> {
    return left(RepoError.methodNotImplemented('KnexEventsRepo.exists'));
  }
  async save(e: Event): Promise<Either<RepoError, Event>> {
    return left(RepoError.methodNotImplemented('KnexEventsRepo.save'));
  }
}
