import { Either, right, flatten } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { Apc } from '../../domain/Apc';
import { ApcPaginated } from '../../domain/ApcPaginated';

import { ApcRepoContract } from '../apcRepo';
import { ApcMap } from '../../mappers/ApcMap';

import moment from 'moment';

export class KnexApcRepo
  extends AbstractBaseDBRepo<Knex, Apc>
  implements ApcRepoContract {
  async getRecentApcs(
    args?: any
  ): Promise<Either<GuardFailure | RepoError, ApcPaginated>> {
    const { pagination, filters } = args;
    const { db, logger } = this;

    const getModel = () => db(TABLES.CATALOG);

    const offset = pagination.offset * pagination.limit;

    const totalCount = await getModel().count(`${TABLES.CATALOG}.id`).first();

    let sql = getModel()
      .orderBy(`${TABLES.CATALOG}.timestamp`, 'desc')
      .select([`${TABLES.CATALOG}.*`]);

    // if (!('download' in filters)) {
    //   sql = sql
    //     .offset(offset < totalCount.count ? offset : 0)
    //     .limit(pagination.limit);
    // }

    logger.debug('select', {
      sql: sql.toString(),
    });

    const rawLogs: Array<any> = await sql;

    return (flatten(rawLogs.map(ApcMap.toDomain)) as any).map((logs) => {
      return {
        totalCount: totalCount.count,
        auditLogs: logs,
      };
    });
  }

  async updatePrice(price: string): Promise<Either<GuardFailure | RepoError, Apc>> {
    const { db } = this;

    const updatedApc = ApcMap.toPersistence(apc);

    await db(TABLES.CATALOG).update(price, 'price').;

    return right(apc);
  }

  async updatePublisher(
    apc: Apc
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    return right(false);
  }
}
