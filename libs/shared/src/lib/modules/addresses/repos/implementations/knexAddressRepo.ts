import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { AddressId } from '../../domain/AddressId';
import { Address } from '../../domain/Address';

import { AddressMap } from '../../mappers/AddressMap';

import { AddressRepoContract } from '../addressRepo';

export class KnexAddressRepo
  extends AbstractBaseDBRepo<Knex, Address>
  implements AddressRepoContract {
  async save(
    address: Address
  ): Promise<Either<GuardFailure | RepoError, Address>> {
    const { db } = this;
    await db(TABLES.ADDRESSES).insert(AddressMap.toPersistence(address));

    return this.findById(address.addressId);
  }

  async findById(
    addressId: AddressId
  ): Promise<Either<GuardFailure | RepoError, Address>> {
    const { db } = this;

    const addressRow = await db(TABLES.ADDRESSES)
      .select()
      .where('id', addressId.id.toString())
      .first();

    if (!addressRow) {
      return left(
        RepoError.createEntityNotFoundError('address', addressId.id.toString())
      );
    }

    return AddressMap.toDomain(addressRow);
  }

  async exists(
    address: Address
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    try {
      await this.findById(address.addressId);
    } catch (err) {
      if (err.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return right(false);
      }

      return left(RepoError.fromDBError(err));
    }

    return right(true);
  }
}
