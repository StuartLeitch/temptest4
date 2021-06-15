import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Entity } from '../../../core/domain/Entity';
import { Guard } from '../../../core/logic/Guard';

import { PriceValue } from './PriceValue';
import { PriceId } from './PriceId';

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

  public static create(
    props: PriceProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, Price> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.value, argumentName: 'value' },
    ]);

    if (!guardResult.succeeded) {
      return left(new GuardFailure(guardResult.message));
    } else {
      return right(
        new Price(
          {
            ...props,
          },
          id
        )
      );
    }
  }
}
