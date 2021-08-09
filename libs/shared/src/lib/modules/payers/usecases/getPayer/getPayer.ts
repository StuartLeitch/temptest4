// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { PayerId } from '../../domain/PayerId';

import { PayerRepoContract } from '../../repos/payerRepo';

import { GetPayerResponse as Response } from './getPayerResponse';
import type { GetPayerDTO as DTO } from './getPayerDTO';

export class GetPayerUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Response, Context> {
  constructor(private payerRepo: PayerRepoContract) {
    super();
  }

  @Authorize('payer:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const { payerId } = request;

      if (!payerId) {
        return left(
          new UnexpectedError(new Error(`Invalid payer id=${payerId}`))
        );
      }

      const maybePayer = await this.payerRepo.getPayerById(
        PayerId.create(new UniqueEntityID(payerId))
      );

      if (maybePayer.isRight()) {
        return right(maybePayer.value);
      } else {
        return left(new UnexpectedError(new Error(maybePayer.value.message)));
      }
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
