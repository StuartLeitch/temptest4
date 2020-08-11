/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { PayerRepoContract } from '../../repos/payerRepo';
import { PayerId } from '../../domain/PayerId';
import { Payer } from '../../domain/Payer';

// * Usecase specific
import { GetPayerDetailsResponse } from './getPayerDetailsResponse';
import { GetPayerDetailsErrors } from './getPayerDetailsErrors';
import { GetPayerDetailsDTO } from './getPayerDetailsDTO';

export class GetPayerDetailsUsecase
  implements
    UseCase<
      GetPayerDetailsDTO,
      Promise<GetPayerDetailsResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetPayerDetailsDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private payerRepo: PayerRepoContract) {}

  public async execute(
    request: GetPayerDetailsDTO,
    context?: UsecaseAuthorizationContext
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
      return left(new UnexpectedError(e));
    }
  }
}
