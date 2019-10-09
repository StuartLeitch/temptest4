// * Core Domain
import {ValueObject} from '../../../core/domain/ValueObject';
import {Result} from '../../../core/logic/Result';

interface CouponValueProps {
  value: number;
}

export class CouponValue extends ValueObject<CouponValueProps> {
  get value(): number {
    return this.props.value;
  }

  private constructor(props: CouponValueProps) {
    super(props);
  }

  public static create(value: number): Result<CouponValue> {
    if (!!value === false || isNaN(value)) {
      return Result.fail<CouponValue>('Must provide a valid coupon value.');
    } else {
      return Result.ok<CouponValue>(new CouponValue({value}));
    }
  }
}
