/* eslint-disable @typescript-eslint/no-unused-vars */

import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Result, right, left } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';

import { Address } from '../../domain/Address';
import { AddressId } from '../../domain/AddressId';
import { GetAddressResponse } from './getAddressResponse';
import { AddressRepoContract } from '../../repos/addressRepo';
import { GetAddressRequestDTO } from './getAddressRequestDTO';

export class GetAddressUseCase
  implements
    UseCase<
      GetAddressRequestDTO,
      Promise<GetAddressResponse>,
      UsecaseAuthorizationContext
    > {
  constructor(private addressRepo: AddressRepoContract) {}

  public async execute(
    request: GetAddressRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetAddressResponse> {
    try {
      const addressId = AddressId.create(
        new UniqueEntityID(request.billingAddressId)
      );
      const address = await this.addressRepo.findById(addressId);

      return right(Result.ok<Address>(address));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
