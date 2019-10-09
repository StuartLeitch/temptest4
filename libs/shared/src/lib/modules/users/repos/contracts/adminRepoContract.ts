import {Repo} from '../../../../infrastructure/Repo';
import {Admin} from '../../domain/Admin';
import {UserId} from '../../domain/UserId';

export interface AdminRepoContract extends Repo<Admin> {
  getById(userId: string): Promise<Admin>;
  getCollection(params?: string[]): Promise<Admin[]>;
  delete(admin: Admin): Promise<unknown>;
}
