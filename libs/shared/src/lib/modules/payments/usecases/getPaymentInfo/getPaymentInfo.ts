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
import { GetPaymentInfoResponse as Response } from './getPaymentInfoResponse';
import type { GetPaymentInfoDTO as DTO } from './getPaymentInfoDTO';
import * as Errors from './getPaymentInfoErrors';

export class GetPaymentInfoUsecase
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

  @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    try {
      const uuid = new UniqueEntityID(request.invoiceId);
      const id = InvoiceId.create(uuid);

      const invoiceExists = await this.invoiceRepo.existsWithId(id);

      if (!invoiceExists) {
        return left(new Errors.InvoiceNotFoundError(request.invoiceId));
      }

      try {
        const maybePayments = await this.paymentRepo.getPaymentsByInvoiceId(id);

        if (maybePayments.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybePayments.value.message))
          );
        }

        const payments = maybePayments.value;

        if (payments.length === 0) {
          return left(new Errors.NoPaymentFoundError(request.invoiceId));
        }
      } catch (e) {
        return left(new Errors.PaymentInfoDbError(request.invoiceId, e));
      }

      try {
        const maybePaymentInfo = await this.invoiceRepo.getInvoicePaymentInfo(
          id
        );

        if (maybePaymentInfo.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybePaymentInfo.value.message))
          );
        }

        return right(maybePaymentInfo.value);
      } catch (e) {
        return left(new Errors.PaymentInfoDbError(request.invoiceId, e));
      }
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }
}
