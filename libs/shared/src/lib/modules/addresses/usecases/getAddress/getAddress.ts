import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';

import { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { AddressId } from '../../domain/AddressId';

import { AddressRepoContract } from '../../repos/addressRepo';

import { GetAddressResponse as Response } from './getAddressResponse';
import { GetAddressRequestDTO as DTO } from './getAddressDTO';
import * as Errors from './getAddressErrors';

export class GetAddressUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private addressRepo: AddressRepoContract) {
    super();
  }

  @Authorize('address:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const addressId = AddressId.create(
        new UniqueEntityID(request.billingAddressId)
      );

      const maybeAddress = await this.addressRepo.findById(addressId);

      if (maybeAddress.isLeft()) {
        if (
          maybeAddress.value instanceof RepoError &&
          maybeAddress.value.code === RepoErrorCode.ENTITY_NOT_FOUND
        ) {
          return left(
            new Errors.AddressNotFoundError(request.billingAddressId)
          );
        } else {
          throw maybeAddress.value;
        }
      }

      return right(maybeAddress.value);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
