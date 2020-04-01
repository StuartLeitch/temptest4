import { Repo } from './Repo';

export abstract class AbstractBaseDBRepo<DB, T> implements Repo<T> {
  constructor(protected db: DB, protected logger?: any) {}

  abstract async exists(t: T): Promise<boolean>;
  abstract async save(t: T): Promise<T>;
}
