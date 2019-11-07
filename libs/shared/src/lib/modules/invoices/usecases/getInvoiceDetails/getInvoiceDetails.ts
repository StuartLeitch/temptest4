// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result, left, right} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {AppError} from '../../../../core/logic/AppError';

// * Authorization Logic
import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
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
  constructor(
    private invoiceRepo: InvoiceRepoContract // private waiverRepo: WaiverRepoContract, // private vatService: VATService, // private waiverService: WaiverService
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:read')
  public async execute(
    request: GetInvoiceDetailsDTO,
    context?: GetInvoiceDetailsContext
  ): Promise<GetInvoiceDetailsResponse> {
    let invoice: Invoice;

    // * get a proper InvoiceId
    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();

    try {
      // * System identifies invoice by Invoice Id
      try {
        invoice = await this.invoiceRepo.getInvoiceById(invoiceId);
      } catch (err) {
        return left(
          new GetInvoiceDetailsErrors.InvoiceNotFoundError(
            invoiceId.id.toString()
          )
        );
      }

      // * This is where all the magic happens
      return right(Result.ok<Invoice>(invoice));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
