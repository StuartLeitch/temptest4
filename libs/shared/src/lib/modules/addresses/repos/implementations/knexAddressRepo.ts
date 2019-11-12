import {Address} from '../../domain/Address';
import {AddressId} from '../../domain/AddressId';
import {AddressRepoContract} from '../addressRepo';
import {AddressMap} from '../../mappers/AddressMap';
import {Knex, TABLES} from '../../../../infrastructure/database/knex';
import {RepoErrorCode, RepoError} from '../../../../infrastructure/RepoError';
import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';

export class KnexAddressRepo extends AbstractBaseDBRepo<Knex, Address>
  implements AddressRepoContract {
  async save(address: Address): Promise<Address> {
    const {db} = this;
    await db(TABLES.ADDRESS).insert(AddressMap.toPersistence(address));

    return await this.findById(address.addressId);
  }

  async findById(addressId: AddressId): Promise<Address> {
    const {db} = this;

    const addressRow = await db(TABLES.ADDRESS)
      .select()
      .where('id', addressId.id.toString())
      .first();

    if (!addressRow) {
      throw RepoError.createEntityNotFoundError(
        'address',
        addressId.id.toString()
      );
    }

    return AddressMap.toDomain(addressRow);
  }

  async exists(address: Address): Promise<boolean> {
    try {
      await this.findById(address.addressId);
    } catch (err) {
      if (err.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return false;
      }

      throw err;
    }

    return true;
  }
}
