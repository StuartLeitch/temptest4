import Knex from 'knex';
import { Config } from '../../config';

export async function makeDb(config: Config): Promise<Knex> {
  const knex = Knex({
    client: 'pg',
    migrations: {
      directory: config.dbMigrationsDir
    },
    seeds: {
      directory: config.dbSeedsDir
    },
    connection: {
      host: config.dbHost,
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbDatabase
    }
  });

  await knex.migrate.latest();

  // ! Disable seeding for now
  // await knex.seed.run();

  return knex;
}

export async function destroyDb(db: Knex): Promise<void> {
  db.destroy();
}
