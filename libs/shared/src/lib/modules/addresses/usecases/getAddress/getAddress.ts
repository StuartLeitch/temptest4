import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Result, right, left } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize,
} from '../../../../domain/authorization/decorators/Authorize';

import { Address } from '../../domain/Address';
import { AddressId } from '../../domain/AddressId';
import { AddressMap } from '../../mappers/AddressMap';
import { GetAddressResponse } from './getAddressResponse';
import { AddressRepoContract } from '../../repos/addressRepo';
import { GetAddressRequestDTO } from './getAddressRequestDTO';

type Context = AuthorizationContext<Roles>;
export type GetAddressUseCaseContext = Context;

export class GetAddressUseCase
  implements
    UseCase<
      GetAddressRequestDTO,
      Promise<GetAddressResponse>,
      GetAddressUseCaseContext
    > {
  constructor(private addressRepo: AddressRepoContract) {}

  public async execute(
    request: GetAddressRequestDTO,
    context?: Context
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
