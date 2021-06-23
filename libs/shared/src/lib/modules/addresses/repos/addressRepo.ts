import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { RepoError } from '../../../infrastructure/RepoError';
import { Repo } from '../../../infrastructure/Repo';

import { Address } from '../domain/Address';
import { AddressId } from '../domain/AddressId';

export interface AddressRepoContract extends Repo<Address> {
  findById(
    addressId: AddressId
  ): Promise<Either<GuardFailure | RepoError, Address>>;
}
