import {AddressProps} from '../../domain/Address';
import {AddressMap} from '../../mappers/AddressMap';
import {AddressRepoContract} from '../../repos/addressRepo';

export class CreateAddress {
  constructor(private addressRepo: AddressRepoContract) {}

  public execute(addressProps: AddressProps) {
    try {
      return AddressMap.toDomain(addressProps);
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
