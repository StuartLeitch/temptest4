import Knex from 'knex';
import { Logger } from '@hindawi/shared';
import { materializedViewList } from '../views';
import { differenceInSeconds } from '../../utils/utils';

const logger = new Logger(__filename);

export async function refreshViews(knex: Knex) {
  const refreshStart = new Date();
  for (const view of materializedViewList) {
    const refreshQuery = view.getRefreshQuery();
    if (!refreshQuery) {
      logger.info('Skipping ' + view.getViewName());
      continue;
    }
    const queryStart = new Date();
    try {
      await knex.raw(refreshQuery);
      logger.info(
        `${refreshQuery} took ${differenceInSeconds(queryStart)} seconds`
      );
    } catch (error) {
      logger.error(error);
    }
  }
  logger.info(
    `Refreshing views took ${differenceInSeconds(refreshStart)} seconds`
  );
}
