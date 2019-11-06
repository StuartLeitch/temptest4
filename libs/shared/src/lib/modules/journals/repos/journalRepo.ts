import {Repo} from '../../../infrastructure/Repo';
import {Journal} from '../domain/Journal';

export interface JournalRepoContract extends Repo<Journal> {}
