/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { Invoice } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { GetInvoiceDetailsResponse } from './getInvoiceDetailsResponse';
import { GetInvoiceDetailsErrors } from './getInvoiceDetailsErrors';
import { GetInvoiceDetailsDTO } from './getInvoiceDetailsDTO';

export class GetInvoiceDetailsUsecase
  implements
    UseCase<
      GetInvoiceDetailsDTO,
      Promise<GetInvoiceDetailsResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetInvoiceDetailsDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:read')
  public async execute(
    request: GetInvoiceDetailsDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetInvoiceDetailsResponse> {
    let invoice: Invoice;

    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();

    try {
      try {
        invoice = await this.invoiceRepo.getInvoiceById(invoiceId);
      } catch (err) {
        return left(
          new GetInvoiceDetailsErrors.InvoiceNotFoundError(
            invoiceId.id.toString()
          )
        );
      }

      return right(Result.ok<Invoice>(invoice));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
