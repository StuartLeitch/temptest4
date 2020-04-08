import * as Knex from 'knex';
import { submissionDataView } from '../../views';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';

export async function up(knex: Knex): Promise<any> {
  await knex.raw(submissionDataView.getTriggerQuery());
  await knex.raw(`
UPDATE ${REPORTING_TABLES.SUBMISSION}
SET time=subquery.time
FROM (SELECT id, time 
  from ${REPORTING_TABLES.SUBMISSION} se 
  join ${submissionDataView.getViewName()} sd 
    on sd.event_id = se.id
  where sd.event_timestamp is null
) AS subquery
WHERE ${REPORTING_TABLES.SUBMISSION}.id = subquery.id;
  `);
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20200406150014_add_sub_data_update_trigger.ts';
