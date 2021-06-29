// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceItem } from '../../domain/InvoiceItem';

import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { InvoiceItemRepoContract } from './../../repos/invoiceItemRepo';

// * Usecase specific
import { GetInvoiceIdByManuscriptCustomIdResponse as Response } from './getInvoiceIdByManuscriptCustomIdResponse';
import type { GetInvoiceIdByManuscriptCustomIdDTO as DTO } from './getInvoiceIdByManuscriptCustomIdDTO';
import * as Errors from './getInvoiceIdByManuscriptCustomIdErrors';

export class GetInvoiceIdByManuscriptCustomIdUsecase
  extends AccessControlledUsecase<unknown, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private articleRepo: ArticleRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract
  ) {
    super();
  }

  @Authorize('invoice:readByCustomId')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { customId } = request;

    let manuscript: Manuscript;
    let invoiceItems: InvoiceItem[];

    try {
      try {
        // * System identifies manuscript by custom Id
        const maybeManuscript = await this.articleRepo.findByCustomId(customId);

        if (maybeManuscript.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeManuscript.value.message))
          );
        }

        manuscript = maybeManuscript.value;
      } catch (e) {
        return left(new Errors.ManuscriptNotFoundError(customId));
      }

      try {
        // * System identifies Invoice Item by Manuscript Id
        const maybeInvoiceItems = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(
          manuscript.manuscriptId
        );

        if (maybeInvoiceItems.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeInvoiceItems.value.message))
          );
        }

        invoiceItems = maybeInvoiceItems.value;
      } catch (e) {
        return left(
          new Errors.InvoiceItemNotFoundError(
            manuscript.manuscriptId.id.toString()
          )
        );
      }

      const invoiceIds = invoiceItems.map((ii) => ii.invoiceId);

      return right(invoiceIds);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
