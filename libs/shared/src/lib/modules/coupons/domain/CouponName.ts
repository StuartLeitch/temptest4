import {ValueObject} from '../../../core/domain/ValueObject';
import {Result} from '../../../core/logic/Result';

interface CouponNameProps {
  value: string;
}

export class CouponName extends ValueObject<CouponNameProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: CouponNameProps) {
    super(props);
  }

  public static create(name: string): Result<CouponName> {
    if (!!name === false || name.length === 0) {
      return Result.fail<CouponName>('Must provide a coupon name');
    } else {
      return Result.ok<CouponName>(new CouponName({value: name}));
    }
  }
}
