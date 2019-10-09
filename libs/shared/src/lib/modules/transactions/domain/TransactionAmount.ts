import {ValueObject} from '../../../core/domain/ValueObject';
import {Result} from '../../../core/logic/Result';

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

  public static create(value: number): Result<TransactionAmount> {
    if (isNaN(value) || value === 0 || value < 0) {
      return Result.fail<TransactionAmount>('Must provide a valid amount');
    } else {
      return Result.ok<TransactionAmount>(new TransactionAmount({value}));
    }
  }
}
