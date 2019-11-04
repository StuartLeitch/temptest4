// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result, left, right} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {AppError} from '../../../../core/logic/AppError';
import {AddPayerToInvoiceErrors} from './addPayerToInvoiceErrors';
import {AddPayerToInvoiceResponse} from './addPayerToInvoiceResponse';

import {Invoice} from '../../../invoices/domain/Invoice';
import {InvoiceRepoContract} from './../../../invoices/repos/invoiceRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';
import {InvoiceId} from '../../../invoices/domain/InvoiceId';
import {PayerId} from '../../../payers/domain/PayerId';

export interface AddPayerToInvoiceRequestDTO {
  invoiceId: string;
  payerId: string;
}

export type AddPayerToInvoiceContext = AuthorizationContext<Roles>;

export class AddPayerToInvoiceUsecase
  implements
    UseCase<
      AddPayerToInvoiceRequestDTO,
      Promise<AddPayerToInvoiceResponse>,
      AddPayerToInvoiceContext
    >,
    AccessControlledUsecase<
      AddPayerToInvoiceRequestDTO,
      AddPayerToInvoiceContext,
      AccessControlContext
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {
    this.invoiceRepo = invoiceRepo;
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:update')
  public async execute(
    request: AddPayerToInvoiceRequestDTO,
    context?: AddPayerToInvoiceContext
  ): Promise<AddPayerToInvoiceResponse> {
    const {invoiceId, payerId} = request;
    let invoice: Invoice;

    try {
      try {
        invoice = await this.invoiceRepo.getInvoiceById(
          InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
        );
      } catch (err) {
        return left(
          new AddPayerToInvoiceErrors.InvoiceNotFoundError(invoiceId)
        );
      }

      invoice.payerId = PayerId.create(new UniqueEntityID(payerId));

      invoice = await this.invoiceRepo.save(invoice);

      return right(Result.ok<Invoice>(invoice));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
