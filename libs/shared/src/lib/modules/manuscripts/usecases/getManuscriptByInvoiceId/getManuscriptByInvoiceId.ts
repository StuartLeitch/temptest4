// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { Manuscript } from '../../domain/Manuscript';

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../repos/articleRepo';

// * Usecase specific
import { GetManuscriptByInvoiceIdResponse as Response } from './getManuscriptByInvoiceIdResponse';
import { GetManuscriptByInvoiceIdDTO as DTO } from './getManuscriptByInvoiceIdDTO';
import * as Errors from './getManuscriptByInvoiceIdErrors';

export class GetManuscriptByInvoiceIdUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private manuscriptRepo: ArticleRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract
  ) {
    super();

    this.getManuscriptsForInvoiceItems = this.getManuscriptsForInvoiceItems.bind(
      this
    );
    this.getInvoiceItems = this.getInvoiceItems.bind(this);
    this.sanitizeInput = this.sanitizeInput.bind(this);
  }

  @Authorize('manuscript:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const execution = await new AsyncEither(request)
      .then(this.sanitizeInput)
      .map(({ invoiceId }) => invoiceId)
      .then(this.getInvoiceItems)
      .then(this.getManuscriptsForInvoiceItems)
      .execute();

    return execution;
  }

  private async sanitizeInput(
    request: DTO
  ): Promise<Either<Errors.InvalidInvoiceId, { invoiceId: InvoiceId }>> {
    const { invoiceId } = request;
    if (!invoiceId) {
      return left(new Errors.InvalidInvoiceId(invoiceId));
    }
    const maybeInvoiceId = this.convertUuid(invoiceId).chain(
      this.convertInvoiceId
    );

    return maybeInvoiceId.map((invoiceId) => ({ invoiceId }));
  }

  private convertUuid(
    id: string
  ): Either<Errors.InvalidInvoiceId, UniqueEntityID> {
    try {
      return right(new UniqueEntityID(id));
    } catch {
      return left(new Errors.InvalidInvoiceId(id));
    }
  }

  private convertInvoiceId(
    uuid: UniqueEntityID
  ): Either<Errors.InvalidInvoiceId, InvoiceId> {
    try {
      return right(InvoiceId.create(uuid));
    } catch {
      return left(new Errors.InvalidInvoiceId(uuid.toString()));
    }
  }

  private async getInvoiceItems(
    invoiceId: InvoiceId
  ): Promise<Either<UnexpectedError | Errors.NoApcForInvoice, InvoiceItem[]>> {
    try {
      const maybeInvoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
        invoiceId
      );

      if (maybeInvoiceItems.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeInvoiceItems.value.message))
        );
      }

      const invoiceItems = maybeInvoiceItems.value;

      if (invoiceItems.length === 0) {
        return left(new Errors.NoApcForInvoice(invoiceId.id.toString()));
      }

      const maybeUpdated = await this.invoiceItemRepo.getItemsByInvoiceId(
        invoiceId
      );

      if (maybeUpdated.isLeft()) {
        return left(new UnexpectedError(new Error(maybeUpdated.value.message)));
      }

      return right(maybeUpdated.value);
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }

  private async getManuscriptsForInvoiceItems(
    invoiceItems: InvoiceItem[]
  ): Promise<Either<UnexpectedError, Manuscript[]>> {
    const APCs = invoiceItems.filter(
      (invoiceItem) => invoiceItem.type === 'APC'
    );
    const manuscripts: Manuscript[] = [];

    try {
      for (const invoiceItem of APCs) {
        const maybeManuscript = await this.manuscriptRepo.findById(
          invoiceItem.manuscriptId
        );

        if (maybeManuscript.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeManuscript.value.message))
          );
        }

        manuscripts.push(maybeManuscript.value);
      }
    } catch (e) {
      return left(new UnexpectedError(e));
    }

    return right(manuscripts);
  }
}
