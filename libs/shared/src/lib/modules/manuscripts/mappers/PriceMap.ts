import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { Mapper } from '../../../infrastructure/Mapper';

import { PriceValue } from '../domain/PriceValue';
import { Price } from '../domain/Price';

export class PriceMap extends Mapper<Price> {
  public static toDomain(raw: any): Either<GuardFailure, Price> {
    return PriceValue.create(raw.value).chain((value) =>
      Price.create(
        {
          value,
        },
        new UniqueEntityID(raw.id)
      )
    );
  }

  public static toPersistence(price: Price): any {
    return {
      id: price.id.toString(),
      value: price.props.value,
    };
  }
}
