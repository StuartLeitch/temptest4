import Knex from 'knex';

import { LoggerBuilder } from '@hindawi/shared';
import {ManuscriptUploadInfoRepo} from "@hindawi/import-manuscript-commons";

export interface Repos {
  manuscriptInfoRepo: ManuscriptUploadInfoRepo;
}

export function buildRepos(db: Knex, loggerBuilder: LoggerBuilder): Repos {
  return {
    manuscriptInfoRepo: new ManuscriptUploadInfoRepo(db)
  };
}
