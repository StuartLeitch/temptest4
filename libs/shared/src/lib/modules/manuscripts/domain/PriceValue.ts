import {ValueObject} from '../../../core/domain/ValueObject';
import {Result} from '../../../core/logic/Result';

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

  public static create(value: number): Result<PriceValue> {
    if (!!value === false || isNaN(value)) {
      return Result.fail<PriceValue>('Must provide a valid price value.');
    } else {
      return Result.ok<PriceValue>(new PriceValue({value}));
    }
  }
}
