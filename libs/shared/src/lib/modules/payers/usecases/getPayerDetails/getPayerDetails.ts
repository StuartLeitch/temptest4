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

import { PayerRepoContract } from '../../repos/payerRepo';
import { PayerId } from '../../domain/PayerId';
import { Payer } from '../../domain/Payer';

// * Usecase specific
import { GetPayerDetailsResponse as Response } from './getPayerDetailsResponse';
import type { GetPayerDetailsDTO as DTO } from './getPayerDetailsDTO';
import * as Errors from './getPayerDetailsErrors';

export class GetPayerDetailsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private payerRepo: PayerRepoContract) {
    super();
  }

  @Authorize('payer:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let payer: Payer;

    const payerId = PayerId.create(new UniqueEntityID(request.payerId));

    try {
      try {
        const maybePayer = await this.payerRepo.getPayerById(payerId);

        if (maybePayer.isLeft()) {
          return left(new UnexpectedError(new Error(maybePayer.value.message)));
        }

        payer = maybePayer.value;
      } catch (e) {
        return left(new Errors.PayerNotFoundError(payer.id.toString()));
      }

      return right(payer);
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }
}
