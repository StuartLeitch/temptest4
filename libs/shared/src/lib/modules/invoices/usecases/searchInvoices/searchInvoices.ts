// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result} from '../../../../core/logic/Result';

import {Invoice /*, STATUS as InvoiceStatus */} from '../../domain/Invoice';
import {InvoiceRepoContract} from '../../repos/invoiceRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

export interface SearchInvoicesRequestDTO {
  params: string[];
}

export type SearchInvoicesContext = AuthorizationContext<Roles>;

export class SearchInvoices
  implements
    UseCase<SearchInvoicesRequestDTO, Result<Invoice[]>, SearchInvoicesContext>,
    AccessControlledUsecase<
      SearchInvoicesRequestDTO,
      SearchInvoicesContext,
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
    const {params} = request;
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
