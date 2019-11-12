// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result, Either} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {Address, AddressProps} from '../../../addresses/domain/Address';
import {Payer} from '../../domain/Payer';

import {PayerType} from '../../domain/Payer';
import {PayerId} from '../../domain/PayerId';
import {Email} from '../../../../domain/Email';
import {PayerName} from '../../domain/PayerName';
import {PayerRepoContract} from '../../repos/payerRepo';
import {AddressRepoContract} from '../../../addresses/repos/addressRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';
import {AppError} from '../../../../core/logic/AppError';
import {InvoiceRepoContract} from '../../../invoices/repos';

export interface UpdatePayerRequestDTO {
  payerId?: string;
  type?: PayerType; // to map PayerType
  name: string;
  email: string;
  addressId: string;
}

export type UpdatePayerContext = AuthorizationContext<Roles>;

export class UpdatePayerUsecase
  implements
    UseCase<UpdatePayerRequestDTO, Result<Payer>, UpdatePayerContext>,
    AccessControlledUsecase<
      UpdatePayerRequestDTO,
      UpdatePayerContext,
      AccessControlContext
    > {
  constructor(private payerRepo: PayerRepoContract) {
    this.payerRepo = payerRepo;
  }

  private async getPayer(
    request: UpdatePayerRequestDTO
  ): Promise<Result<Payer>> {
    const {payerId} = request;

    if (!payerId) {
      return Result.fail<Payer>(`Invalid Payer id=${payerId}`);
    }

    const payer = await this.payerRepo.getPayerById(
      PayerId.create(new UniqueEntityID(payerId))
    );
    const found = !!payer;

    if (found) {
      return Result.ok<Payer>(payer);
    } else {
      return Result.fail<Payer>(`Couldn't find payer by id=${payerId}`);
    }
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('payer:update')
  public async execute(
    request: UpdatePayerRequestDTO,
    context?: UpdatePayerContext
  ): Promise<Result<Payer>> {
    try {
      // * System looks-up the payer
      const payerOrError = await this.getPayer(request);

      if (payerOrError.isFailure) {
        return Result.fail<Payer>(payerOrError.error);
      }

      // * System retrieves payer details
      const payer = payerOrError.getValue();

      // * This is where all the magic happens

      payer.set('type', request.type);
      payer.set('name', PayerName.create(request.name).getValue());
      payer.set('email', Email.create({value: request.email}).getValue());

      await this.payerRepo.update(payer);

      return Result.ok<Payer>(payer);
    } catch (err) {
      return Result.fail<Payer>(err);
    }
  }
}
