// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

// * Subdomain

export interface CurrencyProps {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

export class Currency extends AggregateRoot<CurrencyProps> {
  public get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(props: CurrencyProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: CurrencyProps,
    id?: UniqueEntityID
  ): Result<Currency> {
    const currency = new Currency(
      {
        ...props
      },
      id
    );
    return Result.ok<Currency>(currency);
  }
}
