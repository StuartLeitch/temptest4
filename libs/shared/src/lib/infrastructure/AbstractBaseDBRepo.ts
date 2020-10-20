import { Repo } from './Repo';

export abstract class AbstractBaseDBRepo<DB, T> implements Repo<T> {
  constructor(protected db: DB, protected logger?: any) {}

  abstract exists(t: T): Promise<boolean>;
  abstract save(t: T): Promise<T>;
}
