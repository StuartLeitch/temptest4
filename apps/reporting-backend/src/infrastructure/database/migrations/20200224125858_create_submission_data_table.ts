import * as Knex from 'knex';
import { submissionDataView } from '../../views';

export async function up(knex: Knex): Promise<any> {
  await knex.raw(submissionDataView.getCreateQuery());
  await knex.raw(submissionDataView.getTriggerQuery());
}

export async function down(knex: Knex): Promise<any> {
  knex.raw(`DROP table IF EXISTS ${submissionDataView.getViewName()} cascade`);
}

export const name = '20200224125858_create_submission_data_table.ts';
