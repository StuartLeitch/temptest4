import * as path from 'path';
import Knex from 'knex';

import {config} from './knexfile';

export {Knex};

type DbOptions = {
  filename: string;
};

const defaultDbOptions: DbOptions = {
  filename: ':memory:'
};

export async function makeDb(
  options: DbOptions = defaultDbOptions
): Promise<Knex> {
  const db = Knex({
    client: 'sqlite3',
    connection: {
      filename: options.filename
    },
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    },
    // pool: {min: 0, max: 10, idleTimeoutMillis: 500},
    useNullAsDefault: true
  });

  await db.migrate.latest();

  return db;
}

export async function destroyDb(db: Knex): Promise<void> {
  db.destroy();
}

export async function clearTable(db: Knex, ...tables: string[]): Promise<Knex> {
  await Promise.all(tables.map(async table => await db(table).truncate()));

  return db;
}

export const KnexDB = () => Knex(config);
