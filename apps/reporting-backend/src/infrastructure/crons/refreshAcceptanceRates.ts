import Knex from 'knex';
import { Logger } from '@hindawi/shared';
import { differenceInSeconds } from '../../utils/utils';
import acceptanceRatesView from '../views/AcceptanceRatesView';

const logger = new Logger(__filename);

export async function refreshAcceptanceRates(knex: Knex) {
  const refreshStart = new Date();
  try {
    const refreshQuery = acceptanceRatesView.getRefreshQuery();
    await knex.raw(refreshQuery);
  } catch (error) {
    logger.error(error);
  }
  logger.info(
    `Refreshing view took ${differenceInSeconds(refreshStart)} seconds`
  );
}
