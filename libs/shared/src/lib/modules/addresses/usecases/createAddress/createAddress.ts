import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';
import { left } from '../../../../core/logic/Either';

import { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

import { AddressRepoContract } from '../../repos/addressRepo';
import { AddressMap } from '../../mappers/AddressMap';

import { CreateAddressResponse as Response } from './createAddressResponse';
import { CreateAddressRequestDTO as DTO } from './createAddressDTO';
import * as Errors from './createAddressErrors';

export class CreateAddressUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private addressRepo: AddressRepoContract) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { postalCode } = request;
    try {
      if (postalCode && !/^\d{5}$/.test(postalCode)) {
        return left(new Errors.InvalidPostalCode(request.postalCode));
      }

      const maybeAddress = AddressMap.toDomain(request);

      if (maybeAddress.isLeft()) {
        return left(new UnexpectedError(maybeAddress.value as Error));
      }

      await this.addressRepo.save(maybeAddress.value);

      return maybeAddress;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
