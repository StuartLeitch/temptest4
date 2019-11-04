// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {Invoice /* , STATUS as InvoiceStatus*/} from '../../domain/Invoice';
import {InvoiceId} from '../../domain/InvoiceId';
import {InvoiceRepoContract} from '../../repos/invoiceRepo';
import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

export interface GetInvoiceDetailsRequestDTO {
  invoiceId?: string;
}

export type GetInvoiceDetailsContext = AuthorizationContext<Roles>;

export class GetInvoiceDetailsUsecase
  implements
    UseCase<
      GetInvoiceDetailsRequestDTO,
      Result<Invoice>,
      GetInvoiceDetailsContext
    >,
    AccessControlledUsecase<
      GetInvoiceDetailsRequestDTO,
      GetInvoiceDetailsContext,
      AccessControlContext
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {
    this.invoiceRepo = invoiceRepo;
  }

  private async getInvoice(
    request: GetInvoiceDetailsRequestDTO
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

  @Authorize('invoice:read')
  public async execute(
    request: GetInvoiceDetailsRequestDTO,
    context?: GetInvoiceDetailsContext
  ): Promise<Result<Invoice>> {
    // if ('transactionId' in request) {
    //   const transactionOrError = await this.getTransaction(request);
    //   if (transactionOrError.isFailure) {
    //     return Result.fail<Invoice>(transactionOrError.error);
    //   }
    //   transactionId = TransactionId.create(
    //     new UniqueEntityID(rawTransactionId)
    //   );
    // }

    try {
      // * System looks-up the invoice
      const invoiceOrError = await this.getInvoice(request);

      if (invoiceOrError.isFailure) {
        return Result.fail<Invoice>(invoiceOrError.error);
      }

      const invoice = invoiceOrError.getValue();

      // * This is where all the magic happens
      return Result.ok<Invoice>(invoice);
    } catch (err) {
      console.log(err);
      return Result.fail<Invoice>(err);
    }
  }
}
