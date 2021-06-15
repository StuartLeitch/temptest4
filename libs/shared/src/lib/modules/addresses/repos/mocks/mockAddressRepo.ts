import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError } from '../../../../infrastructure/RepoError';

import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { AddressId } from '../../domain/AddressId';
import { Address } from '../../domain/Address';

import { AddressRepoContract } from '../addressRepo';

export class MockAddressRepo
  extends BaseMockRepo<Address>
  implements AddressRepoContract {
  constructor() {
    super();
  }

  async findById(
    addressId: AddressId
  ): Promise<Either<GuardFailure | RepoError, Address>> {
    const match = this._items.find((item) => item.addressId.equals(addressId));

    if (match) {
      return right(match);
    } else {
      return left(
        RepoError.createEntityNotFoundError('address', addressId.toString())
      );
    }
  }

  async exists(
    address: Address
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const match = this._items.find((item) =>
      item.addressId.equals(address.addressId)
    );
    return right(!!match);
  }
  async save(
    address: Address
  ): Promise<Either<GuardFailure | RepoError, Address>> {
    const maybeAlreadyExists = await this.exists(address);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      return left(RepoError.fromDBError(new Error('Duplicate Address')));
    }

    this._items.push(address);

    return right(address);
  }

  public compareMockItems(a: Address, b: Address): boolean {
    return a.id.equals(b.id);
  }
}
