import { Either, right, left } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { ValueObject } from '../../../core/domain/ValueObject';

interface PayerTypeProps {
  value: string;
}

export class PayerType extends ValueObject<PayerTypeProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: PayerTypeProps) {
    super(props);
  }

  public static create(type: string): Either<GuardFailure, PayerType> {
    if (!!type === false || type.length === 0) {
      return left(new GuardFailure('Must provide a payer type'));
    } else {
      return right(new PayerType({ value: type }));
    }
  }
}
