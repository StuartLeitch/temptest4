// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { AppError } from '../../../../core/logic/AppError';
import { CreatePayerErrors } from './createPayerErrors';
import { CreatePayerResponse } from './createPayerResponse';

import { PayerRepoContract } from '../../repos/payerRepo';
import { PayerMap } from '../../mapper/Payer';
import { Invoice } from '../../../invoices/domain/Invoice';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import { Payer, PayerType } from '../../domain/Payer';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';

export interface CreatePayerRequestDTO {
  invoiceId: string;
  type: string;
  name: string;
  email?: string;
  vatId?: string;
  organization?: string;
  addressId?: string;
}

export type CreatePayerContext = AuthorizationContext<Roles>;

export class CreatePayerUsecase
  implements
    UseCase<
      CreatePayerRequestDTO,
      Promise<CreatePayerResponse>,
      CreatePayerContext
    >,
    AccessControlledUsecase<
      CreatePayerRequestDTO,
      CreatePayerContext,
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
    context?: CreatePayerContext
  ): Promise<CreatePayerResponse> {
    const {
      name,
      type,
      email,
      invoiceId,
      addressId,
      vatId,
      organization
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
        organization
      });

      await this.payerRepo.save(payer);

      return right(Result.ok<Payer>(payer));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
