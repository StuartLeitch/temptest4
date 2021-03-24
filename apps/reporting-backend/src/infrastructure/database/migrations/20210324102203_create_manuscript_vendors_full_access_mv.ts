import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';

const logger = new Logger(__filename);

export async function up(knex: Knex): Promise<any> {
  logger.info('Migrating view: manuscript_vendors_full_access');
  let queryStart = new Date();

  //* manuscript_vendors_full_access is dependant on manuscripts

  const manuscriptsViewName = 'manuscripts';

  await knex.raw(`
  CREATE OR REPLACE VIEW manuscript_vendors_full_access
  AS SELECT * from ${manuscriptsViewName};
      `);

  logger.info(
    `Creating table and indices manuscript_vendors_full_access took ${differenceInSeconds(
      queryStart
    )} seconds`
  );
}

export async function down(knex: Knex): Promise<any> {}

export const name =
  '20210324102203_create_manuscript_vendors_full_access_mv.ts';
