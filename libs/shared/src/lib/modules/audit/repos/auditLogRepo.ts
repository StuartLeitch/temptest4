import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { RepoError } from '../../../infrastructure/RepoError';
import { Repo } from '../../../infrastructure/Repo';

import { AuditLog } from '../domain/AuditLog';
import { AuditLogPaginated } from '../domain/AuditLogPaginated';

export interface AuditLogRepoContract extends Repo<AuditLog> {
  getRecentAuditLogs(args?: any): Promise<Either<GuardFailure | RepoError, AuditLogPaginated>>;
  save(
    auditLog: AuditLog
  ): Promise<Either<GuardFailure | RepoError, AuditLog>>;
}
