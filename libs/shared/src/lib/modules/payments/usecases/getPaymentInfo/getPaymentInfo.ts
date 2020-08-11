/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Result, right, left } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';

import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { PaymentRepoContract } from '../../repos/paymentRepo';

// * Usecase specific
import { GetPaymentInfoResponse as Response } from './getPaymentInfoResponse';
import { GetPaymentInfoDTO as DTO } from './getPaymentInfoDTO';
import * as Errors from './getPaymentInfoErrors';

export class GetPaymentInfoUsecase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private paymentRepo: PaymentRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:read')
  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    try {
      const uuid = new UniqueEntityID(request.invoiceId);
      const id = InvoiceId.create(uuid).getValue();

      const invoiceExists = await this.invoiceRepo.existsWithId(id);

      if (!invoiceExists) {
        return left(new Errors.InvoiceNotFoundError(request.invoiceId));
      }

      try {
        const payments = await this.paymentRepo.getPaymentsByInvoiceId(id);

        if (payments.length === 0) {
          return left(new Errors.NoPaymentFoundError(request.invoiceId));
        }
      } catch (e) {
        return left(new Errors.PaymentInfoDbError(request.invoiceId, e));
      }

      try {
        const paymentInfo = await this.invoiceRepo.getInvoicePaymentInfo(id);
        return right(Result.ok(paymentInfo));
      } catch (e) {
        return left(new Errors.PaymentInfoDbError(request.invoiceId, e));
      }
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }
}
