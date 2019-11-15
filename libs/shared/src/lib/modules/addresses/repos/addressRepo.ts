import {Repo} from '../../../infrastructure/Repo';

import {Address} from '../domain/Address';
import {AddressId} from '../domain/AddressId';

export interface AddressRepoContract extends Repo<Address> {
  findById(addressId: AddressId): Promise<Address>;
}
