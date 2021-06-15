import { GuardFailure } from '../core/logic/GuardFailure';
import { Either } from '../core/logic/Either';

import { RepoError } from './RepoError';
import { Repo } from './Repo';

export abstract class AbstractBaseDBRepo<DB, T> implements Repo<T> {
  constructor(protected db: DB, protected logger?: any) {}

  abstract exists(t: T): Promise<Either<GuardFailure | RepoError, boolean>>;
  abstract save(t: T): Promise<Either<GuardFailure | RepoError, T>>;
}
