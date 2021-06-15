import { GuardFailure } from '../core/logic/GuardFailure';
import { Either } from '../core/logic/Either';

import { RepoError } from './RepoError';

export interface Repo<T> {
  exists(t: T): Promise<Either<GuardFailure | RepoError, boolean>>;
  save(t: T): Promise<Either<GuardFailure | RepoError, T>>;
}
