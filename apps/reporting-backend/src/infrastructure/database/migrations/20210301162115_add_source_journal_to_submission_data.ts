import * as Knex from 'knex';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import { submissionDataView } from '../../views';

export async function up(knex: Knex): Promise<any> {
  await knex.schema.alterTable(
    submissionDataView.getViewName(),
    function (table) {
      table.text('source_journal').nullable();
    }
  );
  await knex.raw(submissionDataView.getTriggerQuery());
  await knex.raw(`
UPDATE ${submissionDataView.getViewName()}
SET source_journal=subquery.source_journal
FROM (SELECT sd.event_id, se.payload -> 'manuscripts' -> sd.last_version_index -> 'sourceJournal' ->>'name'::text as source_journal
  from ${REPORTING_TABLES.SUBMISSION} se 
  join ${submissionDataView.getViewName()} sd 
    on sd.event_id = se.id
) AS subquery
WHERE ${submissionDataView.getViewName()}.event_id = subquery.event_id;
  `);
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.alterTable(
    submissionDataView.getViewName(),
    function (table) {
      table.dropColumn('source_journal');
    }
  );
}

export const name = '20210301162115_add_source_journal_to_submission_data.ts';
