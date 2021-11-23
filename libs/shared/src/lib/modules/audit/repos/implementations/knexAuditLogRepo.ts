import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { AuditLog } from '../../domain/AuditLog'
import { AuditLogPaginated } from '../../domain/AuditLogPaginated';

import { AuditLogRepoContract } from '../auditLogRepo';

export class KnexAuditLogRepo
  extends AbstractBaseDBRepo<Knex, AuditLog>
  implements AuditLogRepoContract {

  async getRecentAuditLogs(args?: any): Promise<Either<GuardFailure | RepoError, AuditLogPaginated>> {
    const { pagination } = args;
    const { db, logger } = this;

    const getModel = () =>
      db(TABLES.AUDIT_LOGS);

    const totalCount = await getModel().count(
      `${TABLES.AUDIT_LOGS}.id`
    );

    const offset = pagination.offset * pagination.limit;

    const sql = getModel()
    .orderBy(`${TABLES.AUDIT_LOGS}.timestamp`, 'desc')
    .offset(offset < totalCount[0].count ? offset : 0)
    .limit(pagination.limit)
    .select([`${TABLES.AUDIT_LOGS}.*`]);

    logger.debug('select', {
      sql: sql.toString(),
    });

    const rawLogs: Array<any> = await sql;

    const logs = rawLogs.map(l => ({
      id: l.id,
      userAccount: l.user_account,
      timestamp: l.timestamp,
      action: l.action,
      entity: l.entity
    }) as any);

    return right({
      totalCount: `${totalCount[0]['count']}`,
      auditLogs: logs
    });
  }

  async getLogById(logId: string): Promise<Either<GuardFailure | RepoError, any>> {
    const { db } = this;

    const rawLog = await db(TABLES.AUDIT_LOGS)
      .select()
      .where('id', logId.toString())
      .first();

    const auditLog = {
      id: rawLog.id,
      userAccount: rawLog.user_account,
      timestamp: rawLog.timestamp,
      action: rawLog.action,
      entity: rawLog.entity,
    };

    return right(auditLog);
  }

  async save(
    auditLog: AuditLog
  ): Promise<Either<GuardFailure | RepoError, AuditLog>> {
    const { db } = this;

    const newAuditLog = {
      id: auditLog.id.toString(),
      timestamp: auditLog.timestamp.toISOString(),
      user_account: auditLog.userAccount,
      entity: auditLog.entity,
      action: auditLog.action,
    }

    await db(TABLES.AUDIT_LOGS).insert(newAuditLog);

    return right(auditLog);
  }

  async exists(
    auditLog: AuditLog
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    return right(false);
  }
}
