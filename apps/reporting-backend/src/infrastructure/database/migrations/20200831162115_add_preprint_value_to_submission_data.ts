import * as Knex from 'knex';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import { submissionDataView } from '../../views';

export async function up(knex: Knex): Promise<any> {
  await knex.schema.alterTable(submissionDataView.getViewName(), function (
    table
  ) {
    table.text('preprint_value').nullable();
  });
  await knex.raw(submissionDataView.getTriggerQuery());
  await knex.raw(`
UPDATE ${submissionDataView.getViewName()}
SET preprint_value=subquery.preprint_value
FROM (SELECT sd.event_id, se.payload -> 'manuscripts' -> sd.last_version_index ->> 'preprintValue' as preprint_value
  from ${REPORTING_TABLES.SUBMISSION} se 
  join ${submissionDataView.getViewName()} sd 
    on sd.event_id = se.id
) AS subquery
WHERE ${submissionDataView.getViewName()}.event_id = subquery.event_id;
  `);
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.alterTable(submissionDataView.getViewName(), function (
    table
  ) {
    table.dropColumn('preprint_value');
  });
}

export const name = '20200831162115_add_preprint_value_to_submission_data.ts';
