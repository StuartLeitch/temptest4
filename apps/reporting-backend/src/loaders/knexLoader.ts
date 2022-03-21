import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';

import Knex from 'knex';
import { differenceInSeconds } from '../utils/utils';
import { env } from '../env';
import { knexMigrationSource } from '../infrastructure/database/migrationSource';

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
    const refreshStart = new Date();
    try {
        console.log(`Start refresh views.`);
        await knex.raw(`CALL public.refresh_all_materialized_views()`);
        console.log(`Refresh views took ${differenceInSeconds(refreshStart)} seconds.`);
      } catch (error) {
        console.error(error);
      }
  });

  if (settings) {
    settings.setData('connection', knex);
    settings.onShutdown(() => knex.destroy());
  }
};
