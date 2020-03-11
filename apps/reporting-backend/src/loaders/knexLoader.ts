import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import Knex from 'knex';

import { env } from '../env';

import { knexMigrationSource } from '../infrastructure/database/migrationSource';

export const knexLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const knex = Knex({
    client: 'pg',
    migrations: {
      migrationSource: knexMigrationSource
    },
    connection: {
      host: env.db.host,
      user: env.db.username,
      password: env.db.password,
      database: env.db.database
    }
    // debug: true
  });

  let [batch, migrations] = await knex.migrate.latest();

  if (migrations.length > 0) {
    console.log('Migrating views:');
    await knexMigrationSource.migrateViews(knex);
  }

  if (settings) {
    settings.setData('connection', knex);
    settings.onShutdown(() => knex.destroy());
  }
};
