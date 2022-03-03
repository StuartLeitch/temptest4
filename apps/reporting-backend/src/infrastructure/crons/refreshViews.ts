import Knex from 'knex';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/Logger';
import { differenceInSeconds } from '../../utils/utils';

const logger = new Logger(__filename);

export async function refreshViews(knex: Knex) {
  const refreshStart = new Date();

    const queryStart = new Date();
    try {
      await knex.raw(`CALL public.refresh_all_materialized_views()`);
      logger.info(
        `Refresh views took ${differenceInSeconds(queryStart)} seconds`
      );
    } catch (error) {
      logger.error(error);
    }
  logger.info(
    `Refreshing views took ${differenceInSeconds(refreshStart)} seconds`
  );
}
