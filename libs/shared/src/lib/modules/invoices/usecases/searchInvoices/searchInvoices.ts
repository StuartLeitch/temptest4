/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result } from '../../../../core/logic/Result';

import { Invoice } from '../../domain/Invoice';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Authorization Logic
import {
  Authorize,
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

export interface SearchInvoicesRequestDTO {
  params: string[];
}

export class SearchInvoices
  implements
    UseCase<
      SearchInvoicesRequestDTO,
      Result<Invoice[]>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      SearchInvoicesRequestDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  private invoiceRepo: InvoiceRepoContract;

  constructor(invoiceRepo: InvoiceRepoContract) {
    this.invoiceRepo = invoiceRepo;
  }

  private async searchInvoices(params: string[]): Promise<Result<Invoice[]>> {
    // const invoices = await this.invoiceRepo.getInvoiceCollection(params);
    // TODO mock this until we know what params look like
    const invoices = [];

    if (!invoices) {
      return Result.fail<Invoice[]>(
        `Couldn't find invoice(s) matching ${params}`
      );
    }

    return Result.ok<Invoice[]>(invoices);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:search')
  public async execute(
    request: SearchInvoicesRequestDTO
  ): Promise<Result<Invoice[]>> {
    const { params } = request;
    try {
      // * System searches for invoice matching query params
      const invoicesOrError = await this.searchInvoices(params);
      if (invoicesOrError.isFailure) {
        return Result.fail<Invoice[]>(invoicesOrError.error);
      }
      const invoices = invoicesOrError.getValue();

      // magic happens here
      return Result.ok<Invoice[]>(invoices);
    } catch (err) {
      return Result.fail<Invoice[]>(err);
    }
  }
}
