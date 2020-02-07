import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { AddressRepoContract } from '../addressRepo';
import { Address } from '../../domain/Address';
import { AddressId } from '../../domain/AddressId';

export class MockAddressRepo extends BaseMockRepo<Address>
  implements AddressRepoContract {
  constructor() {
    super();
  }

  async findById(addressId: AddressId): Promise<Address> {
    const match = this._items.find(item => item.addressId.equals(addressId));
    return match ? match : null;
  }

  async exists(address: Address): Promise<boolean> {
    const match = this._items.find(item =>
      item.addressId.equals(address.addressId)
    );
    return !!match;
  }
  async save(address: Address): Promise<Address> {
    if (await this.exists(address)) {
      throw Error('duplicate');
    }

    this._items.push(address);
    return address;
  }

  public compareMockItems(a: Address, b: Address): boolean {
    return a.id.equals(b.id);
  }
}
