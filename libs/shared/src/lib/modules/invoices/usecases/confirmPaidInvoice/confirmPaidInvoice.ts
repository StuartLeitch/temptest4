// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {Invoice} from '../../domain/Invoice';
import {InvoiceId} from '../../domain/InvoiceId';
import {InvoiceRepoContract} from '../../repos/invoiceRepo';
import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

export interface ConfirmPaidInvoiceRequestDTO {
  invoiceId?: string;
}

export type ConfirmPaidInvoiceContext = AuthorizationContext<Roles>;

export class ConfirmPaidInvoiceUsecase
  implements
    UseCase<
      ConfirmPaidInvoiceRequestDTO,
      Result<Invoice>,
      ConfirmPaidInvoiceContext
    >,
    AccessControlledUsecase<
      ConfirmPaidInvoiceRequestDTO,
      ConfirmPaidInvoiceContext,
      AccessControlContext
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {
    this.invoiceRepo = invoiceRepo;
  }

  private async getInvoice(
    request: ConfirmPaidInvoiceRequestDTO
  ): Promise<Result<Invoice>> {
    const {invoiceId} = request;

    if (!invoiceId) {
      return Result.fail<Invoice>(`Invalid invoice id=${invoiceId}`);
    }

    const invoice = await this.invoiceRepo.getInvoiceById(
      InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
    );
    const found = !!invoice;

    if (found) {
      return Result.ok<Invoice>(invoice);
    } else {
      return Result.fail<Invoice>(`Couldn't find invoice by id=${invoiceId}`);
    }
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:confirm')
  public async execute(
    request: ConfirmPaidInvoiceRequestDTO,
    context?: ConfirmPaidInvoiceContext
  ): Promise<Result<Invoice>> {
    try {
      // * System looks-up the invoice
      const invoiceOrError = await this.getInvoice(request);

      if (invoiceOrError.isFailure) {
        return Result.fail<Invoice>(invoiceOrError.error);
      }

      const invoice = invoiceOrError.getValue();

      // * This is where all the magic happens
      invoice.markAsPaid();

      return Result.ok<Invoice>(invoice);
    } catch (err) {
      console.log(err);
      return Result.fail<Invoice>(err);
    }
  }
}
