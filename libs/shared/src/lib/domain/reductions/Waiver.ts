// * Core Domain
import {Result} from '../../core/logic/Result';
import {UniqueEntityID} from '../../core/domain/UniqueEntityID';

import {ReductionProps} from './Reduction';
import {Discount} from './Discount';

export class Waiver extends Discount {
  readonly reductionPercentage: number = 1;

  public static create(
    props: ReductionProps,
    id?: UniqueEntityID
  ): Result<Waiver> {
    return Result.ok<Waiver>(
      new Waiver(
        {
          ...props,
          type: 'WAIVER'
        },
        id
      )
    );
  }

  get percentage(): number {
    return this.reductionPercentage;
  }
}
