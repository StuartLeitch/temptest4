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

  async getRecentAuditLogs(): Promise<Either<GuardFailure | RepoError, AuditLogPaginated>> {
    return right({
      auditLogs: [{
        id: '666'
      }],
      totalCount: '1'
    });
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
      old_value: auditLog.oldValue,
      current_value: auditLog.currentValue,
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
