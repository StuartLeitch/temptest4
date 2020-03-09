import * as Knex from 'knex';
import { submissionDataView } from '../../views';

export async function up(knex: Knex): Promise<any> {
  await Promise.all([
    knex.raw(
      `ALTER TABLE ${submissionDataView.getViewName()}  DROP COLUMN IF EXISTS submission_date CASCADE;`
    ),
    knex.raw(
      `ALTER TABLE ${submissionDataView.getViewName()}  DROP COLUMN IF EXISTS updated_date CASCADE;`
    ),
    knex.raw(
      `ALTER TABLE ${submissionDataView.getViewName()}  DROP COLUMN IF EXISTS updated_date CASCADE;`
    ),
    knex.schema.table(submissionDataView.getViewName(), table =>
      table.index('event_timestamp')
    ),
    knex.raw(submissionDataView.getTriggerFunction())
  ]);
}

export async function down(knex: Knex): Promise<any> {
  await knex.raw(
    `ALTER TABLE ${submissionDataView.getViewName()} ADD COLUMN IF NOT EXISTS submission_date timestamp;`
  );
  await knex.raw(
    `ALTER TABLE ${submissionDataView.getViewName()} ADD COLUMN IF NOT EXISTS updated_date timestamp;`
  );
  await knex.schema.table(submissionDataView.getViewName(), table =>
    table.dropIndex('event_timestamp')
  );
}

export const name = '20200304113458_remove_wrong_dates_from_submission_data.ts';
