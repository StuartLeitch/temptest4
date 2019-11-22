import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, right, left } from '../../../../core/logic/Result';

import { Address } from '../../domain/Address';
import { AddressId } from '../../domain/AddressId';
import { AddressMap } from '../../mappers/AddressMap';
import { GetAddressResponse } from './getAddressResponse';
import { AddressRepoContract } from '../../repos/addressRepo';
import { GetAddressRequestDTO } from './getAddressRequestDTO';
import { UniqueEntityID } from 'libs/shared/src/lib/core/domain/UniqueEntityID';

export class GetAddressUseCase
  implements UseCase<GetAddressRequestDTO, Promise<GetAddressResponse>> {
  constructor(private addressRepo: AddressRepoContract) {}

  public async execute(
    request: GetAddressRequestDTO
  ): Promise<GetAddressResponse> {
    try {
      const addressId = AddressId.create(
        new UniqueEntityID(request.billingAddressId)
      );
      const address = await this.addressRepo.findById(addressId);

      return right(Result.ok<Address>(address));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
