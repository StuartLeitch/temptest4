import { ValueObject } from '../../../core/domain/ValueObject';
import { Result } from '../../../core/logic/Result';

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

  public static create(name: string): Result<PayerName> {
    if (!!name === false || name.length === 0) {
      return Result.fail<PayerName>('Must provide a payer name');
    } else {
      return Result.ok<PayerName>(new PayerName({ value: name }));
    }
  }

  toString(): string {
    return this.props.value.trim();
  }
}
