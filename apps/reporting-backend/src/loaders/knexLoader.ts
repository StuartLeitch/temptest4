import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import Knex from 'knex';

import { env } from '../env';

import { knexMigrationSource } from '../infrastructure/database/migrationSource';
import { materializedViewList } from '../infrastructure/views';
// import * as create_materialized_views from '../infrastructure/database/migrations/create_materialized_views';

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
    // debug: true
  });

  // console.info(materializedViewList);
  // process.exit(0);

  await knex.migrate.latest({
    migrationSource: knexMigrationSource,
  }).then(async ([_, migrationsList]) => {
    // if (migrationsList.length === 0) {
    //   console.log('Skipping after migration refresh');
    //   return;
    // }

    // // create_materialized_views.up(knex)
  });

  // console.log('Started refresh');
  // for (let view of materializedViewList) {
  //     if (view.shouldRefresh) {
  //       console.log(`Refreshing ${view.getViewName()}`);
  //       // avoid running concurrent queries that will break if ran first
  //       await knex.raw(
  //         `REFRESH MATERIALIZED VIEW ${view.getViewName()} WITH DATA;`
  //       );
  //     }
  // }
  // console.log('Finished refresh');

  console.log('Started refresh');
  const matViews = [
    'invoices_data',
    'article_data',
    'users_data',
    'checker_submission_data',
    'checker_team_data',
    'journals_data',
    'peer_review_data',
    'checker_to_submission',
    'checker_to_team',
    'journals',
    'journal_sections'
  ];
  for (let view of matViews) {
    console.log(`Refreshing ${view}`);
    // avoid running concurrent queries that will break if ran first
    await knex.raw(
      `REFRESH MATERIALIZED VIEW ${view} WITH DATA;`
    );
  }
  console.log('Finished refresh');



  if (settings) {
    settings.setData('connection', knex);
    settings.onShutdown(() => knex.destroy());
  }
};
