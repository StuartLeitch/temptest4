import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import Knex from 'knex';

import { env } from '../env';

import { knexMigrationSource } from '../infrastructure/database/migrationSource';
import { materializedViewList } from '../infrastructure/views';

export const knexLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const knex = Knex({
    client: 'pg',
    migrations: {
      migrationSource: knexMigrationSource,
    },
    connection: {
      host: env.db.host,
      user: env.db.username,
      password: env.db.password,
      database: env.db.database,
    },
    // debug: true
  });

  await knex.migrate.latest().then(async () => {
    let queries: string[] = [];
    console.log('Started refresh');
    for (let view of materializedViewList) {
      if (view.shouldRefresh) {
        // avoid running concurent queries that will break if ran first
        await knex.raw(
          `REFRESH MATERIALIZED VIEW ${view.getViewName()} WITH DATA;`
        );
      }
    }
    console.log('Finished refresh');
  });

  if (settings) {
    settings.setData('connection', knex);
    settings.onShutdown(() => knex.destroy());
  }
};
