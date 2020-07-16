/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { chain } from '../../../../core/logic/EitherChain';
import { Result, left, right, Either } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { ArticleRepoContract } from '../../repos/articleRepo';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';

// * Usecase specific
import { GetManuscriptByInvoiceIdResponse } from './getManuscriptByInvoiceIdResponse';
import { GetManuscriptByInvoiceIdErrors } from './getManuscriptByInvoiceIdErrors';
import { GetManuscriptByInvoiceIdDTO } from './getManuscriptByInvoiceIdDTO';

// import { GetItemsForInvoiceUsecase } from '../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { Manuscript } from '../../domain/Manuscript';

export class GetManuscriptByInvoiceIdUsecase
  implements
    UseCase<
      GetManuscriptByInvoiceIdDTO,
      Promise<GetManuscriptByInvoiceIdResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetManuscriptByInvoiceIdDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private manuscriptRepo: ArticleRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: GetManuscriptByInvoiceIdDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetManuscriptByInvoiceIdResponse> {
    const maybeInvoiceId = this.sanitizeInput(request).map(
      ({ invoiceId }) => invoiceId
    );
    const maybeManuscripts = await chain(
      [
        this.getInvoiceItems.bind(this),
        this.getManuscriptsForInvoiceItems.bind(this),
      ],
      maybeInvoiceId
    );

    return (maybeManuscripts.map((manuscripts) =>
      Result.ok(manuscripts)
    ) as unknown) as GetManuscriptByInvoiceIdResponse;
  }

  private sanitizeInput(
    request: GetManuscriptByInvoiceIdDTO
  ): Either<
    GetManuscriptByInvoiceIdErrors.InvalidInvoiceId,
    { invoiceId: InvoiceId }
  > {
    const { invoiceId } = request;
    if (!invoiceId) {
      return left(
        new GetManuscriptByInvoiceIdErrors.InvalidInvoiceId(invoiceId)
      );
    }
    const maybeInvoiceId = this.convertUuid(invoiceId).chain(
      this.convertInvoiceId
    );

    return maybeInvoiceId.map((invoiceId) => ({ invoiceId }));
  }

  private convertUuid(
    id: string
  ): Either<GetManuscriptByInvoiceIdErrors.InvalidInvoiceId, UniqueEntityID> {
    try {
      return right(new UniqueEntityID(id));
    } catch {
      return left(new GetManuscriptByInvoiceIdErrors.InvalidInvoiceId(id));
    }
  }

  private convertInvoiceId(
    uuid: UniqueEntityID
  ): Either<GetManuscriptByInvoiceIdErrors.InvalidInvoiceId, InvoiceId> {
    try {
      return right(InvoiceId.create(uuid).getValue());
    } catch {
      return left(
        new GetManuscriptByInvoiceIdErrors.InvalidInvoiceId(uuid.toString())
      );
    }
  }

  private async getInvoiceItems(invoiceId: InvoiceId) {
    try {
      const invoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
        invoiceId
      );
      if (invoiceItems.length === 0) {
        return left(
          new GetManuscriptByInvoiceIdErrors.NoApcForInvoice(
            invoiceId.id.toString()
          )
        );
      }
      return right(await this.invoiceItemRepo.getItemsByInvoiceId(invoiceId));
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }

  private async getManuscriptsForInvoiceItems(invoiceItems: InvoiceItem[]) {
    const APCs = invoiceItems.filter(
      (invoiceItem) => invoiceItem.type === 'APC'
    );
    const manuscripts: Manuscript[] = [];

    try {
      for (const invoiceItem of APCs) {
        const manuscript = await this.manuscriptRepo.findById(
          invoiceItem.manuscriptId
        );
        manuscripts.push(manuscript);
      }
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }

    return right(manuscripts);
  }
}
