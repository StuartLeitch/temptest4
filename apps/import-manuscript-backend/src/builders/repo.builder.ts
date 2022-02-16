import Knex from 'knex';

import { LoggerBuilder } from '@hindawi/shared';

export interface Repos {}

export function buildRepos(db: Knex, loggerBuilder: LoggerBuilder): Repos {
  return {};
}
