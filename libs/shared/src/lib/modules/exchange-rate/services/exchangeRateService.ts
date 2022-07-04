import { ExchangeRate } from '../domain/ExchangeRate';

export interface ExchangeRateServiceContract {
  /**
   * Get the exchange rate for the provided month, if it can't be retrieved
   * the closest available exchange rate will be provided. If no exchange rate
   * is available then it will throw an error
   * @param date A date in the format YYYY-DD ex: 2022-05
   */
  getExchangeRate(date: Date): Promise<ExchangeRate>;
}
