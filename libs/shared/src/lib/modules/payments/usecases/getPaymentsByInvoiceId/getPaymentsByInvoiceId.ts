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
import { GetPaymentsByInvoiceIdResponse as Response } from './getPaymentsByInvoiceIdResponse';
import { GetPaymentsByInvoiceIdDTO as DTO } from './getPaymentsByInvoiceIdDTO';
import * as Errors from './getPaymentsByInvoiceIdErrors';

export class GetPaymentsByInvoiceIdUsecase
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

  @Authorize('payments:read')
  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    try {
      const uuid = new UniqueEntityID(request.invoiceId);
      const invoiceId = InvoiceId.create(uuid).getValue();

      const invoiceExists = await this.invoiceRepo.existsWithId(invoiceId);

      if (!invoiceExists) {
        return left(new Errors.InvoiceNotFoundError(request.invoiceId));
      }

      try {
        const payments = await this.paymentRepo.getPaymentsByInvoiceId(
          invoiceId
        );
        return right(Result.ok(payments));
      } catch (err) {
        return left(
          new Errors.RetrievingPaymentsDbError(request.invoiceId, err)
        );
      }
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
