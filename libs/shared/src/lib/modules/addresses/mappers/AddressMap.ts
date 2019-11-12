import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';
import {Address} from '../domain/Address';
// import {PriceId} from '../domain/PriceId';

export class AddressMap extends Mapper<Address> {
  public static toDomain(raw: any): Address {
    const addressOrError = Address.create(
      {
        // journalId: JournalId.create(new UniqueEntityID(raw.journalId)).getValue(),
        city: raw.city,
        country: raw.country,
        addressLine1: raw.addressLine1
      },
      new UniqueEntityID(raw.id)
    );

    // addressOrError.isFailure ? console.log(articleOrError) : '';

    return addressOrError.isSuccess ? addressOrError.getValue() : null;
  }

  public static toPersistence(address: Address): any {
    return {
      id: address.id.toString(),
      city: address.city,
      country: address.country,
      addressLine1: address.addressLine1
      //
    };
  }
}
