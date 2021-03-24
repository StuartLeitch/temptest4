import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { REPORTING_TABLES, DELETED_MANUSCRIPTS_TABLE } from 'libs/shared/src/lib/modules/reporting/constants';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: manuscript_vendors');
  let queryStart = new Date();

  // * manuscript_vendors is dependant on:
  // * - manuscripts

  const manuscriptsView = 'manuscripts';

  await knex.raw(`
CREATE OR REPLACE VIEW manuscript_vendors
AS SELECT * from ${manuscriptsView} m where m.final_decision_type IS NULL;
`);

  logger.info(
    `Creating view for "manuscript_vendors" took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {
  await knex.raw('DROP VIEW IF EXISTS manuscript_vendors');
}

export const name = '20210324100700_create_manuscript_vendors_mv.ts';
