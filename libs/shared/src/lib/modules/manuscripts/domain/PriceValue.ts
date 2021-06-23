import { Either, right, left } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { ValueObject } from '../../../core/domain/ValueObject';

interface PriceValueProps {
  value: number;
}

export class PriceValue extends ValueObject<PriceValueProps> {
  get value(): number {
    return this.props.value;
  }

  private constructor(props: PriceValueProps) {
    super(props);
  }

  public static create(value: number): Either<GuardFailure, PriceValue> {
    if (!!value === false || isNaN(value)) {
      return left(new GuardFailure('Must provide a valid price value.'));
    } else {
      return right(new PriceValue({ value }));
    }
  }
}
