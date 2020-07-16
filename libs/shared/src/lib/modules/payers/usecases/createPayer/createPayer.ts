/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';

import { AppError } from '../../../../core/logic/AppError';
import { CreatePayerResponse } from './createPayerResponse';

import { PayerRepoContract } from '../../repos/payerRepo';
import { PayerMap } from '../../mapper/Payer';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { Payer } from '../../domain/Payer';

export interface CreatePayerRequestDTO {
  invoiceId: string;
  type: string;
  name: string;
  email?: string;
  vatId?: string;
  organization?: string;
  addressId?: string;
}

export class CreatePayerUsecase
  implements
    UseCase<
      CreatePayerRequestDTO,
      Promise<CreatePayerResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      CreatePayerRequestDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private payerRepo: PayerRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // ! Disable authorization for now!
  // @Authorize('payer:create')
  public async execute(
    request: CreatePayerRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<CreatePayerResponse> {
    const {
      name,
      type,
      email,
      invoiceId,
      addressId,
      vatId,
      organization,
    } = request;

    let payer: Payer;

    try {
      payer = PayerMap.toDomain({
        invoiceId,
        name,
        email,
        type,
        addressId,
        vatId,
        organization,
      });

      await this.payerRepo.save(payer);

      return right(Result.ok<Payer>(payer));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
