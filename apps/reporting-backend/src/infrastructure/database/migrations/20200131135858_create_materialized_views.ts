import * as Knex from 'knex';
import { materializedViewList } from '../../views/index';

export async function up(knex: Knex): Promise<any> {
  for (const view of materializedViewList) {
    await knex.raw(view.getViewName());
    for (const indexQuery of view.getPostCreateQueries()) {
      await knex.raw(indexQuery);
    }
  }
}

export async function down(knex: Knex): Promise<any> {
  Promise.all(
    materializedViewList
      .reverse()
      .map(view =>
        knex.raw(`DROP MATERIALIZED VIEW IF EXISTS ${view.getViewName()}`)
      )
  );
}
