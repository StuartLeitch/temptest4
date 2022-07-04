import { ExchangeRate } from '../../domain/ExchangeRate';
import { Currency } from '../../domain/Currency';

import { ExchangeRateServiceContract } from '../exchangeRateService';

interface DateRate {
  exchangeRate: number;
  exchangeDate: Date;
}

export class MockExchangeRateService implements ExchangeRateServiceContract {
  private defaultExchangeRate: ExchangeRate;
  private rates: Array<DateRate> = [];

  constructor() {
    this.defaultExchangeRate = ExchangeRate.create({
      date: new Date(0),
      from: Currency.USD,
      to: Currency.GBP,
      rate: 1.42,
    });
  }

  setDefaultExchangeRate(rate: number = 1.42): void {
    this.defaultExchangeRate = ExchangeRate.create({
      date: new Date(0),
      from: Currency.USD,
      to: Currency.GBP,
      rate,
    });
  }

  async getExchangeRate(exchangeDate: Date): Promise<ExchangeRate> {
    const result = this.rates.find((dateRate) => {
      return dateRate.exchangeDate === exchangeDate;
    });

    if (result) {
      return ExchangeRate.create({
        date: result.exchangeDate,
        rate: result.exchangeRate,
        from: Currency.USD,
        to: Currency.GBP,
      });
    }

    return this.defaultExchangeRate;
  }

  addExchangeRate(dateRate: DateRate): void {
    this.rates.push(dateRate);
  }
}
