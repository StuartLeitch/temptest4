// * Core domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

// * Subdomain
import {CouponId} from './CouponId';
import {CouponName} from './CouponName';
import {CouponValue} from './CouponValue';

interface CouponProps {
  name: CouponName;
  value: CouponValue;
  startDate: Date;
  endDate: Date;
}

export class Coupon extends AggregateRoot<CouponProps> {
  private constructor(props: CouponProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get name(): CouponName {
    return this.props.name;
  }

  get value(): CouponValue {
    return this.props.value;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  public static create(
    props: CouponProps,
    id?: UniqueEntityID
  ): Result<Coupon> {
    const coupon = new Coupon(
      {
        ...props
      },
      id
    );

    return Result.ok<Coupon>(coupon);
  }
}
