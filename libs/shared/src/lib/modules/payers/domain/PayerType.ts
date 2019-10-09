import {ValueObject} from '../../../core/domain/ValueObject';
import {Result} from '../../../core/logic/Result';

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

  public static create(type: string): Result<PayerType> {
    if (!!type === false || type.length === 0) {
      return Result.fail<PayerType>('Must provide a payer type');
    } else {
      return Result.ok<PayerType>(new PayerType({value: type}));
    }
  }
}
