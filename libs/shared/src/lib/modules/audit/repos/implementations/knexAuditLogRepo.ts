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
      auditLogs: [],
      totalCount: '0'
    });
  }

  async save(
    auditLog: AuditLog
  ): Promise<Either<GuardFailure | RepoError, AuditLog>> {
    const { db } = this;
    await db(TABLES.AUDIT_LOGS).insert(auditLog);

    return right(auditLog);
  }

  async exists(
    auditLog: AuditLog
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    return right(false);
  }
}
