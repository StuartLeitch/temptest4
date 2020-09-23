import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import Knex from 'knex';
// import knexTinyLogger from 'knex-tiny-logger';

import { Logger } from '../lib/logger';
import { env } from '../env';

export const knexLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const logger = new Logger();
  const { skippingSeeding } = env.app;

  const knex = Knex({
    client: 'pg',
    migrations: {
      directory: env.app.dirs.migrationsDir,
    },
    seeds: {
      directory: env.app.dirs.seedsDir,
    },
    connection: {
      host: env.db.host,
      user: env.db.username,
      password: env.db.password,
      database: env.db.database,
    },
  });

  await knex.migrate.latest();

  if (!skippingSeeding) {
    await knex.seed.run();
  }

  console.log('Test AFFECTED apps');

  // knex.on('query-response', function(response, obj, builder) {
  //   logger.debug(obj.method, {
  //     query: obj.sql,
  //     rowCount: obj.response.rowCount
  //   });
  // });

  if (settings) {
    settings.setData('connection', knex);
    settings.onShutdown(() => knex.destroy());
  }
};
