import * as Knex from 'knex';
import { materializedViewList } from '../../views';

export async function up(knex: Knex): Promise<any> {
  for (const view of materializedViewList) {
    console.log('Migrating view: ', view.getViewName());
    await knex.raw(view.getCreateQuery());
    for (const indexQuery of view.getPostCreateQueries()) {
      await knex.raw(indexQuery);
    }
  }
}

export async function down(knex: Knex): Promise<any> {
  return Promise.all(
    [...materializedViewList]
      .reverse()
      .map(view =>
        knex.raw(`DROP MATERIALIZED VIEW IF EXISTS ${view.getViewName()}`)
      )
  );
}

export const name = 'create_materialized_views.ts';
