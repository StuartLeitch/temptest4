import * as Knex from 'knex';
import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import { submissionDataView } from '../../views';

export async function up(knex: Knex): Promise<any> {
  await knex.raw(submissionDataView.getTriggerQuery());
  await knex.raw(`
  UPDATE ${REPORTING_TABLES.SUBMISSION} se
  SET time=se.time`);
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210204150015_fix_submission_data_version.ts';
