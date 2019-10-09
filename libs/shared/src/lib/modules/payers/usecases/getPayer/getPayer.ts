// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {Payer} from '../../domain/Payer';
import {PayerId} from '../../domain/PayerId';
import {PayerRepoContract} from '../../repos/payerRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

export interface GetPayerRequestDTO {
  payerId?: string;
}

export type GetPayerContext = AuthorizationContext<Roles>;

export class GetPayerUsecase
  implements
    UseCase<GetPayerRequestDTO, Result<Payer>, GetPayerContext>,
    AccessControlledUsecase<
      GetPayerRequestDTO,
      GetPayerContext,
      AccessControlContext
    > {
  constructor(private payerRepo: PayerRepoContract) {
    this.payerRepo = payerRepo;
  }

  private async getPayer(request: GetPayerRequestDTO): Promise<Result<Payer>> {
    const {payerId} = request;

    if (!payerId) {
      return Result.fail<Payer>(`Invalid payer id=${payerId}`);
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

  @Authorize('payer:read')
  public async execute(
    request: GetPayerRequestDTO,
    context?: GetPayerContext
  ): Promise<Result<Payer>> {
    try {
      // * System looks-up the payer
      const payerOrError = await this.getPayer(request);

      if (payerOrError.isFailure) {
        return Result.fail<Payer>(payerOrError.error);
      }

      const payer = payerOrError.getValue();

      // * This is where all the magic happens
      return Result.ok<Payer>(payer);
    } catch (err) {
      console.log(err);
      return Result.fail<Payer>(err);
    }
  }
}
