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

import { InvoiceId } from '../../../invoices/domain/InvoiceId';

import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { PaymentRepoContract } from '../../repos/paymentRepo';

// * Usecase specific
import { GetPaymentsByInvoiceIdResponse as Response } from './getPaymentsByInvoiceIdResponse';
import type { GetPaymentsByInvoiceIdDTO as DTO } from './getPaymentsByInvoiceIdDTO';
import * as Errors from './getPaymentsByInvoiceIdErrors';

export class GetPaymentsByInvoiceIdUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private paymentRepo: PaymentRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('payments:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    try {
      const uuid = new UniqueEntityID(request.invoiceId);
      const invoiceId = InvoiceId.create(uuid);

      const invoiceExists = await this.invoiceRepo.existsWithId(invoiceId);

      if (!invoiceExists) {
        return left(new Errors.InvoiceNotFoundError(request.invoiceId));
      }

      try {
        const maybePayments = await this.paymentRepo.getPaymentsByInvoiceId(
          invoiceId
        );

        if (maybePayments.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybePayments.value.message))
          );
        }

        return right(maybePayments.value);
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
