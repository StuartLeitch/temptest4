import { ValueObject } from '../core/domain/ValueObject';
import { Result } from '../core/logic/Result';

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

  public static create(value: number): Result<Amount> {
    if (isNaN(value) || value === 0 || value < 0) {
      return Result.fail<Amount>('Must provide a valid amount');
    } else {
      return Result.ok<Amount>(new Amount({ value }));
    }
  }
}
