import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Mapper } from '../../../infrastructure/Mapper';
import { Either } from '../../../core/logic/Either';

import { Address } from '../domain/Address';

export class AddressMap extends Mapper<Address> {
  public static toDomain(raw: any): Either<GuardFailure, Address> {
    const addressOrError = Address.create(
      {
        city: raw.city,
        state: raw.state,
        postalCode: raw.postalCode,
        country: raw.country,
        addressLine1: raw.addressLine1,
        dateCreated: new Date(),
      },
      new UniqueEntityID(raw.id)
    );

    return addressOrError;
  }

  public static toPersistence(address: Address): any {
    return {
      id: address.id.toString(),
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      dateCreated: address.dateCreated,
      addressLine1: address.addressLine1,
    };
  }
}
