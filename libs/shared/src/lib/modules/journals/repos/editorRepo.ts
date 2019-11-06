import {Repo} from '../../../infrastructure/Repo';
import {Editor} from '../domain/Editor';

export interface EditorRepoContract extends Repo<Editor> {
  // delete(transaction: Transaction): Promise<unknown>;
  // update(transaction: Transaction): Promise<Transaction>;
}
