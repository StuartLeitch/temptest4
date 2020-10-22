import * as Knex from 'knex';
import {
  ARTICLE_PUBLISHED_EVENTS,
  REPORTING_TABLES,
} from 'libs/shared/src/lib/modules/reporting/constants';
import { submissionDataView } from '../../views';

export async function up(knex: Knex): Promise<any> {
  // const articles = ARTICLE_PUBLISHED_EVENTS.map((a) => `'${a}'`).join(',');
  const articles = `'ArticlePublished'`;
  return knex.raw(`
  insert into ${REPORTING_TABLES.DEFAULT} select * from ${REPORTING_TABLES.ARTICLE} where type not in (${articles});
  delete from ${REPORTING_TABLES.ARTICLE} where type not in (${articles});
  `);
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20201012162115_move_article_events.ts';
