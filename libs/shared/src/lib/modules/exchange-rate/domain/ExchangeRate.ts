import { GuardArgument, Guard } from '../../../core/logic/Guard';
import {
  ValueObjectProps,
  ValueObject,
} from '../../../core/domain/ValueObject';

import { Currency } from './Currency';

export interface ExchangeRateProps extends ValueObjectProps {
  date: Date;
  rate: number;
  from: Currency;
  to: Currency;
}

export class ExchangeRate extends ValueObject<ExchangeRateProps> {
  get date(): Date {
    return this.props.date;
  }

  get rate(): number {
    return this.props.rate;
  }

  get exchangeRate(): number {
    return Number.parseFloat(this.props.rate.toFixed(2));
  }

  get fromCurrency(): Currency {
    return this.props.from;
  }

  get toCurrency(): Currency {
    return this.props.to;
  }

  private constructor(props: ExchangeRateProps) {
    super(props);
  }

  public static create(props: ExchangeRateProps): ExchangeRate {
    const guardArgs: GuardArgument[] = [
      { argument: props.date, argumentName: 'issue date of the exchange rate' },
      { argument: props.rate, argumentName: 'exchange Rate' },
      { argument: props.from, argumentName: 'original currency' },
      { argument: props.to, argumentName: 'target currency' },
    ];

    Guard.againstNullOrUndefinedBulk(guardArgs).throwIfFailed();

    return new ExchangeRate(props);
  }
}
