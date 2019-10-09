import {UniqueEntityID} from '../../core/domain/UniqueEntityID';

import {Reduction, ReductionProps} from './Reduction';

import {DiscountCreator} from './DiscountCreator';
import {WaiverCreator} from './WaiverCreator';
import {CouponCreator} from './CouponCreator';

enum ReductionTypes {
  DISCOUNT,
  WAIVER,
  COUPON
}

export class ReductionFactory {
  public static createReduction(
    type: string,
    props: ReductionProps,
    id?: UniqueEntityID
  ): Reduction {
    if (type === 'DISCOUNT') {
      const discountCreator = new DiscountCreator();
      return discountCreator.create(props, id).getValue();
    } else if (type === 'WAIVER') {
      const waiverCreator = new WaiverCreator();
      return waiverCreator.create(props, id).getValue();
    } else if (type === 'COUPON') {
      const couponCreator = new CouponCreator();
      return couponCreator.create(props, id).getValue();
    }

    return null;
  }
}
