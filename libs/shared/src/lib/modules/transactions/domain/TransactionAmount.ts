import { Either, right, left } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { ValueObject } from '../../../core/domain/ValueObject';

interface TransactionAmountProps {
  value: number;
}

export class TransactionAmount extends ValueObject<TransactionAmountProps> {
  get value(): number {
    return this.props.value;
  }

  private constructor(props: TransactionAmountProps) {
    super(props);
  }

  public static create(value: number): Either<GuardFailure, TransactionAmount> {
    if (isNaN(value) || value === 0 || value < 0) {
      return left(new GuardFailure('Must provide a valid amount'));
    } else {
      return right(new TransactionAmount({ value }));
    }
  }
}
