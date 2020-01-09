import { Address } from '../domain/Address';
import { Mapper } from '../../../infrastructure/Mapper';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

export class AddressMap extends Mapper<Address> {
  public static toDomain(raw: any): Address {
    const addressOrError = Address.create(
      {
        city: raw.city,
        state: raw.state,
        postalCode: raw.postalCode,
        country: raw.country,
        addressLine1: raw.addressLine1,
        dateCreated: new Date()
      },
      new UniqueEntityID(raw.id)
    );

    return addressOrError.isSuccess ? addressOrError.getValue() : null;
  }

  public static toPersistence(address: Address): any {
    return {
      id: address.id.toString(),
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      dateCreated: address.dateCreated,
      addressLine1: address.addressLine1
    };
  }
}
