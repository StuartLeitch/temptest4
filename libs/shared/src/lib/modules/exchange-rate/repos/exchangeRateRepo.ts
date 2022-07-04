import { Repo } from '../../../infrastructure/Repo';

import { ExchangeRate } from '../domain/ExchangeRate';

export interface ExchangeRateRepoContract extends Repo<ExchangeRate> {
  exchangeRateExistsForDate(date: Date): Promise<boolean>;

  /**
   * Get the exchange rate for the provided year and month. If the exchange
   * rate does not exists it will throw an error
   * @param date A date in the format YYYY-DD ex: 2022-05
   */
  getExchangeRate(date: Date): Promise<ExchangeRate>;

  /**
   * Get the exchange rate for the provided date, if it does not exist get the
   * exchange rate from the closes date available. If no one is available it
   * will throw an error
   * @param date A date in the format YYYY-DD ex: 2022-05
   */
  getClosestExchangeRate(date: Date): Promise<ExchangeRate>;
}
