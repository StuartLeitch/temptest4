// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {Result, left, right} from '../../../../core/logic/Result';

import {PayerId} from '../../domain/PayerId';
import {Name} from '../../../../domain/Name';
import {Email} from '../../../../domain/Email';
import {PayerName} from '../../domain/PayerName';
import {Payer, PayerType} from '../../domain/Payer';
import {PayerRepoContract} from '../../repos/payerRepo';

import {
  Authorize,
  AuthorizationContext,
  AccessControlledUsecase
} from '../../../../domain/authorization/decorators/Authorize';
import {Roles} from '../../../users/domain/enums/Roles';
import {AppError} from '../../../../core/logic/AppError';
import {UpdatePayerResponse} from './updatePayerResponse';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {AddressId} from '../../../addresses/domain/AddressId';

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
  ): Promise<UpdatePayerResponse> {
    const payerOrError = await this.getPayer(request);
    if (payerOrError.isFailure) {
      return left(new AppError.UnexpectedError(payerOrError.errorValue()));
    }

    const payer = payerOrError.getValue();

    payer.setProperties({
      VATId: request.vadId,
      type: PayerType[request.type],
      name: PayerName.create(request.name).getValue(),
      email: Email.create({value: request.email}).getValue(),
      organization: Name.create({value: request.organization}).getValue(),
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
