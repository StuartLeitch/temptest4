// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import { PayerRepoContract } from '../../repos/payerRepo';
import { PayerId } from '../../domain/PayerId';
import { Payer } from '../../domain/Payer';

// * Usecase specific
import { GetPayerDetailsResponse } from './getPayerDetailsResponse';
import { GetPayerDetailsErrors } from './getPayerDetailsErrors';
import { GetPayerDetailsDTO } from './getPayerDetailsDTO';

export type GetPayerDetailsContext = AuthorizationContext<Roles>;

export class GetPayerDetailsUsecase
  implements
    UseCase<
      GetPayerDetailsDTO,
      Promise<GetPayerDetailsResponse>,
      GetPayerDetailsContext
    >,
    AccessControlledUsecase<
      GetPayerDetailsDTO,
      GetPayerDetailsContext,
      AccessControlContext
    > {
  constructor(private payerRepo: PayerRepoContract) {}

  public async execute(
    request: GetPayerDetailsDTO,
    context?: GetPayerDetailsContext
  ): Promise<GetPayerDetailsResponse> {
    let payer: Payer;

    const payerId = PayerId.create(new UniqueEntityID(request.payerId));

    try {
      try {
        payer = await this.payerRepo.getPayerById(payerId);
      } catch (e) {
        return left(
          new GetPayerDetailsErrors.PayerNotFoundError(payer.id.toString())
        );
      }

      return right(Result.ok(payer));
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }
}
