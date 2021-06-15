import { Either, right, left } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { ValueObject } from '../../../core/domain/ValueObject';

interface PayerNameProps {
  value: string;
}

export class PayerName extends ValueObject<PayerNameProps> {
  get value(): string {
    return this.props.value.trim();
  }

  private constructor(props: PayerNameProps) {
    super(props);
  }

  public static create(name: string): Either<GuardFailure, PayerName> {
    if (!!name === false || name.length === 0) {
      return left(new GuardFailure('Must provide a payer name'));
    } else {
      return right(new PayerName({ value: name }));
    }
  }

  toString(): string {
    return this.props.value.trim();
  }
}
