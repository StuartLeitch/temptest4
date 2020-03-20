// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  // Authorize,
  AuthorizationContext,
  AccessControlledUsecase
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';

import { Invoice } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
// import { Manuscript } from '../../../manuscripts/domain/Manuscript';
// import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { GetCreditNoteByInvoiceIdResponse } from './getCreditNoteByInvoiceIdResponse';
import { GetCreditNoteByInvoiceIdErrors } from './getCreditNoteByInvoiceIdErrors';
import { GetCreditNoteByInvoiceIdDTO } from './getCreditNoteByInvoiceIdDTO';

export type GetCreditNoteByInvoiceIdContext = AuthorizationContext<Roles>;

export class GetCreditNoteByInvoiceIdUsecase
  implements
    UseCase<
      GetCreditNoteByInvoiceIdDTO,
      Promise<GetCreditNoteByInvoiceIdResponse>,
      GetCreditNoteByInvoiceIdContext
    >,
    AccessControlledUsecase<
      GetCreditNoteByInvoiceIdDTO,
      GetCreditNoteByInvoiceIdContext,
      AccessControlContext
    > {
  constructor(
    // private articleRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: GetCreditNoteByInvoiceIdDTO,
    context?: GetCreditNoteByInvoiceIdContext
  ): Promise<GetCreditNoteByInvoiceIdResponse> {
    const { invoiceId } = request;

    let creditNote: Invoice;

    try {
      try {
        // * System identifies invoice by cancelled Invoice reference
        creditNote = await this.invoiceRepo.findByCancelledInvoiceReference(
          InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
        );
      } catch (e) {
        return left(
          new GetCreditNoteByInvoiceIdErrors.CreditNoteNotFoundError(invoiceId)
        );
      }

      return right(Result.ok<Invoice>(creditNote));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
