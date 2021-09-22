import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import Knex from 'knex';
import { env } from '../env';

export const knexLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const knex = Knex({
    client: 'pg',
    connection: {
      host: env.db.host,
      user: env.db.username,
      password: env.db.password,
      database: env.db.database,
    },
  });

  if (settings) {
    settings.setData('connection', knex);
    settings.onShutdown(() => knex.destroy());

    const res = await knex.raw(
      "select count(*) from invoices where status = 'ACTIVE'"
    );
    console.log(
      `result for query: "select count(*) from invoices where status = 'ACTIVE'"`,
      res.rows
    );
  }
};
