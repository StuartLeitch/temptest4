// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {AppError} from '../../../../core/logic/AppError';
import {Result, left, right} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  Authorize,
  AuthorizationContext,
  AccessControlledUsecase
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

import {Invoice} from '../../domain/Invoice';
import {InvoiceId} from '../../domain/InvoiceId';
import {InvoiceRepoContract} from '../../repos/invoiceRepo';

// * Usecase specific
import {GetInvoiceDetailsResponse} from './getInvoiceDetailsResponse';
import {GetInvoiceDetailsErrors} from './getInvoiceDetailsErrors';
import {GetInvoiceDetailsDTO} from './getInvoiceDetailsDTO';

export type GetInvoiceDetailsContext = AuthorizationContext<Roles>;

export class GetInvoiceDetailsUsecase
  implements
    UseCase<
      GetInvoiceDetailsDTO,
      Promise<GetInvoiceDetailsResponse>,
      GetInvoiceDetailsContext
    >,
    AccessControlledUsecase<
      GetInvoiceDetailsDTO,
      GetInvoiceDetailsContext,
      AccessControlContext
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:read')
  public async execute(
    request: GetInvoiceDetailsDTO,
    context?: GetInvoiceDetailsContext
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
      return left(new AppError.UnexpectedError(err));
    }
  }
}
