import * as Knex from 'knex';
import { submissionDataView } from '../../views';

export async function up(knex: Knex): Promise<any> {
  await knex.raw(submissionDataView.getCreateQuery());
  await knex.raw(submissionDataView.getTriggerQuery());
  await Promise.all(
    submissionDataView
      .getPostCreateQueries()
      .map(indexQuery => knex.raw(indexQuery))
  );
}

export async function down(knex: Knex): Promise<any> {
  await knex.raw(
    `DROP table IF EXISTS ${submissionDataView.getViewName()} cascade`
  );
  await knex.raw(
    `DROP TRIGGER ${submissionDataView.getTriggerName()} ON public.submission_events;  `
  );
}

export const name = '20200224125858_create_submission_data_table.ts';
