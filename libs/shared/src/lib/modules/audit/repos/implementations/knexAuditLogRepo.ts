import { Either, right, flatten } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { AuditLog } from '../../domain/AuditLog'
import { AuditLogPaginated } from '../../domain/AuditLogPaginated';

import { AuditLogRepoContract } from '../auditLogRepo';
import { AuditLogMap } from '../../mappers/AuditLogMap';

import moment from 'moment';

export class KnexAuditLogRepo
  extends AbstractBaseDBRepo<Knex, AuditLog>
  implements AuditLogRepoContract {

  async getRecentAuditLogs(args?: any): Promise<Either<GuardFailure | RepoError, AuditLogPaginated>> {
    const { pagination, filters } = args;
    const { db, logger } = this;

    const getModel = () =>
      db(TABLES.AUDIT_LOGS);

    const totalCount = await getModel().count(
      `${TABLES.AUDIT_LOGS}.id`
    );

    const offset = pagination.offset * pagination.limit;

    let endDate = new Date();
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 5);

    if (filters) {
      startDate = filters.startDate;
      endDate = filters.endDate;
    }

    let sql = getModel()
      .orderBy(`${TABLES.AUDIT_LOGS}.timestamp`, 'desc')
      .whereBetween('timestamp', [startDate, endDate])
      .select([`${TABLES.AUDIT_LOGS}.*`]);

    if (!('limit' in filters)) {
      sql = sql
        .offset(offset < totalCount[0].count ? offset : 0)
        .limit(pagination.limit);
    }

    logger.debug('select', {
      sql: sql.toString(),
    });

    const rawLogs: Array<any> = await sql;

    return (flatten(rawLogs.map(AuditLogMap.toDomain)) as any).map(logs => {
      return ({
        totalCount: `${totalCount[0]['count']}`,
        auditLogs: logs
      });
    });
  }

  async save(
    auditLog: AuditLog
  ): Promise<Either<GuardFailure | RepoError, AuditLog>> {
    const { db } = this;

    const newAuditLog = AuditLogMap.toPersistence(auditLog);

    await db(TABLES.AUDIT_LOGS).insert(newAuditLog);

    return right(auditLog);

  }

  async exists(
    auditLog: AuditLog
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    return right(false);
  }
}
