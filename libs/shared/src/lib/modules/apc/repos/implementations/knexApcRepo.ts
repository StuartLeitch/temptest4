import { Either, right, flatten } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { Apc } from '../../domain/Apc';
import { ApcPaginated } from '../../domain/AuditLogPaginated';

import { AuditLogRepoContract } from '../apcRepo';
import { ApcMap } from '../../mappers/AuditLogMap';

import moment from 'moment';

export class KnexAuditLogRepo
  extends AbstractBaseDBRepo<Knex, Apc>
  implements AuditLogRepoContract {
  async getRecentAuditLogs(
    args?: any
  ): Promise<Either<GuardFailure | RepoError, ApcPaginated>> {
    const { pagination, filters } = args;
    const { db, logger } = this;

    const getModel = () => db(TABLES.APC);

    const offset = pagination.offset * pagination.limit;

    // let endDate = moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
    // let startDate = moment(new Date()).subtract(5, 'days').format('YYYY-MM-DD');

    // if (filters) {
    //   startDate = moment(filters.startDate).format('YYYY-MM-DD');
    //   endDate = moment(filters.endDate).add(1, 'days').format('YYYY-MM-DD');
    // }

    const totalCount = await getModel().count(`${TABLES.APC}.id`).first();

    const sql = getModel().select([`${TABLES.APC}.*`]);
    // let sql = getModel()
    //   .whereBetween('timestamp', [startDate, endDate])
    //   .orderBy(`${TABLES.AUDIT_LOGS}.timestamp`, 'desc')
    //   .select([`${TABLES.AUDIT_LOGS}.*`]);

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

  async save(apc: Apc): Promise<Either<GuardFailure | RepoError, Apc>> {
    const { db } = this;

    const newAuditLog = ApcMap.toPersistence(apc);

    await db(TABLES.AUDIT_LOGS).insert(newAuditLog);

    return right(apc);
  }

  async exists(apc: Apc): Promise<Either<GuardFailure | RepoError, boolean>> {
    return right(false);
  }
}
