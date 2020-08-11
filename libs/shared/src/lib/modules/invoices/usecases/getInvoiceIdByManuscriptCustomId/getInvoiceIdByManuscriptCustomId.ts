// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';

// * Authorization Logic
import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceId } from '../../domain/InvoiceId';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { InvoiceItemRepoContract } from './../../repos/invoiceItemRepo';

// * Usecase specific
import { GetInvoiceIdByManuscriptCustomIdResponse } from './getInvoiceIdByManuscriptCustomIdResponse';
import { GetInvoiceIdByManuscriptCustomIdErrors } from './getInvoiceIdByManuscriptCustomIdErrors';
import { GetInvoiceIdByManuscriptCustomIdDTO } from './getInvoiceIdByManuscriptCustomIdDTO';

export class GetInvoiceIdByManuscriptCustomIdUsecase
  implements
    UseCase<
      GetInvoiceIdByManuscriptCustomIdDTO,
      Promise<GetInvoiceIdByManuscriptCustomIdResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetInvoiceIdByManuscriptCustomIdDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private articleRepo: ArticleRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: GetInvoiceIdByManuscriptCustomIdDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetInvoiceIdByManuscriptCustomIdResponse> {
    const { customId } = request;

    let manuscript: Manuscript;
    let invoiceItems: InvoiceItem[];
    // const invoiceId: InvoiceId;

    try {
      try {
        // * System identifies manuscript by custom Id
        manuscript = await this.articleRepo.findByCustomId(customId);
      } catch (e) {
        return left(
          new GetInvoiceIdByManuscriptCustomIdErrors.ManuscriptNotFoundError(
            customId
          )
        );
      }

      try {
        // * System identifies Invoice Item by Manuscript Id
        invoiceItems = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(
          manuscript.manuscriptId
        );
      } catch (e) {
        return left(
          new GetInvoiceIdByManuscriptCustomIdErrors.InvoiceItemNotFoundError(
            manuscript.manuscriptId.id.toString()
          )
        );
      }

      const invoiceIds = invoiceItems.map((ii) => ii.invoiceId);

      return right(Result.ok<InvoiceId[]>(invoiceIds));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
