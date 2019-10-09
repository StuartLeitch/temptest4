// * Core Domain
import {Result} from '../../core/logic/Result';
import {UniqueEntityID} from '../../core/domain/UniqueEntityID';

import {Reduction, ReductionProps} from './Reduction';

export class Discount extends Reduction {
  public static create(
    props: ReductionProps,
    id?: UniqueEntityID
  ): Result<Discount> {
    return Result.ok<Discount>(
      new Discount(
        {
          ...props,
          type: 'DISCOUNT'
        },
        id
      )
    );
  }
}
