import * as Knex from 'knex';
import submissionDataView from '../../views/SubmissionDataView';
export async function up(knex: Knex): Promise<any> {
  return Promise.all([
    knex.raw(
      `create index on ${submissionDataView.getViewName()} (submission_id, event_timestamp desc)`
    ),
    knex.raw(
      `create index on ${submissionDataView.getViewName()} (submission_id, submission_event)`
    ),
  ]);
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20200416123141_add_sub_data_index.ts';
