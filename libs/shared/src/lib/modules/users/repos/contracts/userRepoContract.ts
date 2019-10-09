import {Repo} from '../../../../infrastructure/Repo';
import {User} from '../../domain/User';
import {UserId} from '../../domain/UserId';

export interface UserRepoContract extends Repo<User> {
  getById(userId: string): Promise<User>;
  getCollection(params?: string[]): Promise<User[]>;
  delete(user: User): Promise<unknown>;
}
