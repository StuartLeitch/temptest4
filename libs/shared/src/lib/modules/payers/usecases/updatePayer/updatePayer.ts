// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Result, left, right } from '../../../../core/logic/Result';

import { PayerId } from '../../domain/PayerId';
import { Name } from '../../../../domain/Name';
import { Email } from '../../../../domain/Email';
import { PayerName } from '../../domain/PayerName';
import { Payer, PayerType } from '../../domain/Payer';
import { PayerRepoContract } from '../../repos/payerRepo';

import {
  Authorize,
  AuthorizationContext,
  AccessControlledUsecase
} from '../../../../domain/authorization/decorators/Authorize';
import { Roles } from '../../../users/domain/enums/Roles';
import { AppError } from '../../../../core/logic/AppError';
import { UpdatePayerResponse } from './updatePayerResponse';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { AddressId } from '../../../addresses/domain/AddressId';

import { UpdatePayerErrors } from './updatePayerErrors';

export interface UpdatePayerRequestDTO {
  payerId?: string;
  type?: string;
  name: string;
  email: string;
  addressId: string;
  vadId?: string;
  organization?: string;
}

export type UpdatePayerContext = AuthorizationContext<Roles>;

export class UpdatePayerUsecase
  implements
    UseCase<
      UpdatePayerRequestDTO,
      Promise<UpdatePayerResponse>,
      UpdatePayerContext
    >,
    AccessControlledUsecase<
      UpdatePayerRequestDTO,
      UpdatePayerContext,
      AccessControlContext
    > {
  constructor(private payerRepo: PayerRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('payer:update')
  public async execute(
    request: UpdatePayerRequestDTO,
    context?: UpdatePayerContext
  ): Promise<UpdatePayerResponse> {
    let payer: Payer;

    const payerId = PayerId.create(new UniqueEntityID(request.payerId));

    try {
      // * System identifies payer
      payer = await this.payerRepo.getPayerById(payerId);
    } catch (err) {
      return left(new UpdatePayerErrors.PayerNotFoundError(request.payerId));
    }

    payer.setProperties({
      VATId: request.vadId,
      type: PayerType[request.type],
      name: PayerName.create(request.name).getValue(),
      email: Email.create({ value: request.email }).getValue(),
      organization: Name.create({ value: request.organization }).getValue(),
      billingAddressId: AddressId.create(new UniqueEntityID(request.addressId))
    });

    try {
      await this.payerRepo.update(payer);
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }

    return right(Result.ok<Payer>(payer));
  }
}
