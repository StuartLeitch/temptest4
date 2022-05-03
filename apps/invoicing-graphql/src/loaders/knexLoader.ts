import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import Knex from 'knex';
import { env } from '../env';

export const knexLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const { skippingSeeding } = env.app;

  const knex = Knex({
    client: 'pg',
    migrations: {
      directory: env.app.dirs.migrationsDir,
      disableMigrationsListValidation: true
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

  if (settings) {
    settings.setData('connection', knex);
    settings.onShutdown(() => knex.destroy());
  }
};
