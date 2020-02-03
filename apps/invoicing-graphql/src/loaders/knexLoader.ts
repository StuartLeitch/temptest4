import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import Knex from 'knex';
// import knexTinyLogger from 'knex-tiny-logger';

import { env } from '../env';

export const knexLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const knex = Knex({
    client: 'pg',
    migrations: {
      directory: env.app.dirs.migrationsDir
    },
    seeds: {
      directory: env.app.dirs.seedsDir
    },
    connection: {
      host: env.db.host,
      user: env.db.username,
      password: env.db.password,
      database: env.db.database
    }
  });
  // knexTinyLogger(knex);

  await knex.migrate.latest();

  if (settings) {
    settings.setData('connection', knex);
    settings.onShutdown(() => knex.destroy());
  }
};
