// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { PayerMap } from '../../mapper/Payer';

import { PayerRepoContract } from '../../repos/payerRepo';

import { CreatePayerResponse as Response } from './createPayerResponse';
import { CreatePayerRequestDTO as DTO } from './createPayerDTO';
import * as Errors from './createPayerErrors';

export class CreatePayerUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private payerRepo: PayerRepoContract) {
    super();
  }

  @Authorize('payer:create')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const {
      name,
      type,
      email,
      invoiceId,
      addressId,
      vatId,
      organization,
    } = request;

    try {
      const maybePayer = PayerMap.toDomain({
        invoiceId,
        name,
        email,
        type,
        addressId,
        vatId,
        organization,
      });

      if (maybePayer.isLeft()) {
        return left(new Errors.NotAbleToCreatePayerError(invoiceId));
      }

      await this.payerRepo.save(maybePayer.value);

      return right(maybePayer.value);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
