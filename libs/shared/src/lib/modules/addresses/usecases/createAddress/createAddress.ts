import {UseCase} from '../../../../core/domain/UseCase';
import {AppError} from '../../../../core/logic/AppError';
import {Result, right, left} from '../../../../core/logic/Result';

import {Address} from '../../domain/Address';
import {AddressMap} from '../../mappers/AddressMap';
import {AddressRepoContract} from '../../repos/addressRepo';
import {CreateAddressResponse} from './createAddressResponse';
import {CreateAddressRequestDTO} from './createAddressDTO';

export class CreateAddress
  implements UseCase<CreateAddressRequestDTO, Promise<CreateAddressResponse>> {
  constructor(private addressRepo: AddressRepoContract) {}

  public async execute(
    request: CreateAddressRequestDTO
  ): Promise<CreateAddressResponse> {
    try {
      const address = AddressMap.toDomain(request);

      await this.addressRepo.save(address);

      return right(Result.ok<Address>(address));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
