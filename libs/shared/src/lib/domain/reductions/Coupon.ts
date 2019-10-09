// * Core Domain
import {Result} from '../../core/logic/Result';
import {UniqueEntityID} from '../../core/domain/UniqueEntityID';

import {ReductionProps} from './Reduction';
import {Discount} from './Discount';

export class Coupon extends Discount {
  public static create(
    props: ReductionProps,
    id?: UniqueEntityID
  ): Result<Coupon> {
    return Result.ok<Coupon>(
      new Coupon(
        {
          ...props,
          type: 'COUPON'
        },
        id
      )
    );
  }
}
