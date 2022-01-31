import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { RepoError } from '../../../infrastructure/RepoError';
import { Repo } from '../../../infrastructure/Repo';

import { Apc } from '../domain/Apc';
import { ApcPaginated } from '../domain/AuditLogPaginated';

export interface AuditLogRepoContract extends Repo<Apc> {
  getRecentAuditLogs(
    args?: any
  ): Promise<Either<GuardFailure | RepoError, ApcPaginated>>;
  save(apc: Apc): Promise<Either<GuardFailure | RepoError, Apc>>;
}
