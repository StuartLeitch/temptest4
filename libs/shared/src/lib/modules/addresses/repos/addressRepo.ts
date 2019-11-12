import {Repo} from '../../../infrastructure/Repo';

import {Address, AddressProps} from '../domain/Address';
import {AddressId} from '../domain/AddressId';

export interface AddressRepoContract extends Repo<Address> {
  update(address: Address): Promise<Address>;
  findById(addressId: AddressId): Promise<Address>;
}
