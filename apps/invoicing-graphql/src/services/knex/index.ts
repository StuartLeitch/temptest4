import Knex from 'knex';
import { Config } from '../../config';

export async function makeDb(config: Config): Promise<Knex> {
  const knex = Knex({
    client: 'pg',
    connection: {
      host: config.dbHost,
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbDatabase,
    },
  });

  console.log(await knex.migrate.list());

  await knex.migrate.latest();
  return knex;
}
