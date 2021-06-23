import { Either, right, left } from '../core/logic/Either';
import { GuardFailure } from '../core/logic/GuardFailure';
import { ValueObject } from '../core/domain/ValueObject';

interface AmountProps {
  value: number;
}

export class Amount extends ValueObject<AmountProps> {
  get value(): number {
    return this.props.value;
  }

  private constructor(props: AmountProps) {
    super(props);
  }

  public static create(value: number): Either<GuardFailure, Amount> {
    if (isNaN(value) || value === 0 || value < 0) {
      return left(new GuardFailure('Must provide a valid amount'));
    } else {
      return right(new Amount({ value }));
    }
  }
}
