import Knex from 'knex';
import { Config } from '../../config';

export async function makeDb(config: Config): Promise<Knex> {
  const knex = Knex({
    client: 'pg',
    migrations: {
      directory: config.dbMigrationsDir,
    },
    connection: {
      host: config.dbHost,
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbDatabase,
    },
  });

  await knex.migrate.latest();
  return knex;
}
