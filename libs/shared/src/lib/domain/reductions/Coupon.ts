// * Core Domain
import {Result} from '../../core/logic/Result';
import {UniqueEntityID} from '../../core/domain/UniqueEntityID';

import {ReductionProps} from './Reduction';
import {Discount} from './Discount';

export class Coupon extends Discount {
  private constructor(props: ReductionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get reduction(): number {
    return this.props.reduction;
  }

  get created(): Date {
    return this.props.created;
  }

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
