// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {Payer} from '../../domain/Payer';
import {PayerId} from '../../domain/PayerId';
import {PayerType} from '../../domain/PayerType';
import {PayerRepoContract} from '../../repos/payerRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

export interface UpdatePayerRequestDTO {
  payerId?: string;
  type?: string; // to map PayerType
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
  constructor(
    private payerRepo: PayerRepoContract // private transactionRepo: TransactionRepoContract
  ) {
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
      const {type: rawType} = request;

      if (rawType) {
        const type = PayerType.create(rawType).getValue();
        payer.set('type', type);
      }

      await this.payerRepo.update(payer);

      return Result.ok<Payer>(payer);
    } catch (err) {
      console.log(err);
      return Result.fail<Payer>(err);
    }
  }
}
