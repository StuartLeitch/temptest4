import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import Knex from 'knex';
import { env } from '../env';
import { LoggerBuilder } from '@hindawi/shared';

const log = new LoggerBuilder('loader', {
  logLevel: env.log.level,
  isDevelopment: env.isDevelopment,
}).getLogger();

export const knexLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {

  const knexParams = {
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
    asyncStackTraces: true,
    debug: env.db.logQueries
  };

  const knex = Knex(knexParams);

  await knex.migrate.latest();

  if (settings) {
    settings.setData('connection', knex);
    settings.onShutdown(() => knex.destroy());
  }
};
