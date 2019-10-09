import {Entity} from '../../../core/domain/Entity';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';
import {Guard} from '../../../core/logic/Guard';

import {PriceValue} from './PriceValue';
import {PriceId} from './PriceId';

interface PriceProps {
  value: PriceValue;
}

export class Price extends Entity<PriceProps> {
  public static foo = 'bar';

  get id(): UniqueEntityID {
    return this._id;
  }

  get priceId(): PriceId {
    return PriceId.create(this.id);
  }

  get value(): PriceValue {
    return this.props.value;
  }

  private constructor(props: PriceProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: PriceProps, id?: UniqueEntityID): Result<Price> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      {argument: props.value, argumentName: 'value'}
    ]);

    if (!guardResult.succeeded) {
      return Result.fail<Price>(guardResult.message);
    } else {
      return Result.ok<Price>(
        new Price(
          {
            ...props
          },
          id
        )
      );
    }
  }
}
