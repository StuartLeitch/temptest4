import Knex from 'knex';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/LoggerBuilder';
import { LogLevel } from 'libs/shared/src/lib/infrastructure/logging';
import { differenceInSeconds } from '../../utils/utils';
import acceptanceRatesView from '../views/AcceptanceRatesView';

const logger = new Logger(LogLevel.Info, __filename);

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
