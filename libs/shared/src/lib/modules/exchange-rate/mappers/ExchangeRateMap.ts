import { Mapper } from '../../../infrastructure/Mapper';

import { ExchangeRate } from '../domain/ExchangeRate';
import { Currency } from '../domain/Currency';

export class ExchangeRateMap extends Mapper<ExchangeRate> {
  public static toDomain(raw: any): ExchangeRate {
    const dd = raw.exchangeDate as Date;

    const date = new Date(
      Date.UTC(dd.getFullYear(), dd.getMonth(), dd.getDate())
    );

    return ExchangeRate.create({
      rate: raw.exchangeRate,
      date,
      from: raw.from ? Currency[raw.from] : Currency.USD,
      to: raw.to ? Currency[raw.to] : Currency.GBP,
    });
  }

  public static toPersistance(exchangeRate: ExchangeRate) {
    return {
      exchangeDate: exchangeRate.date,
      exchangeRate: exchangeRate.rate,
      from: exchangeRate.fromCurrency,
      to: exchangeRate.toCurrency,
    };
  }
}
