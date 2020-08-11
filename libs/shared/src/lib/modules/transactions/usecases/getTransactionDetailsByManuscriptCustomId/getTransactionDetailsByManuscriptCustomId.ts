// * Core Domain
import { Either, Result, right, left } from '../../../../core/logic/Result';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { Invoice } from '../../../invoices/domain/Invoice';
import { TransactionId } from '../../domain/TransactionId';
import { Transaction } from '../../domain/Transaction';

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { TransactionRepoContract } from '../../repos/transactionRepo';

import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetTransactionUsecase } from '../getTransaction/getTransaction';

// * Usecase specific
import { GetTransactionDetailsByManuscriptCustomIdResponse as Response } from './getTransactionDetailsByManuscriptCustomId.response';
import { GetTransactionDetailsByManuscriptCustomIdDTO as DTO } from './getTransactionDetailsByManuscriptCustomId.dto';
import * as Errors from './getTransactionDetailsByManuscriptCustomId.errors';

export class GetTransactionDetailsByManuscriptCustomIdUsecase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract
  ) {
    this.attachTransaction = this.attachTransaction.bind(this);
    this.attachInvoiceId = this.attachInvoiceId.bind(this);
    this.getTransaction = this.getTransaction.bind(this);
    this.attachInvoice = this.attachInvoice.bind(this);
    this.verifyInput = this.verifyInput.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:read')
  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    try {
      return new AsyncEither(request)
        .then(this.verifyInput)
        .then(this.attachInvoiceId(context))
        .then(this.attachInvoice(context))
        .then(this.attachTransaction(context))
        .map(({ transaction }) => Result.ok(transaction))
        .execute();
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async verifyInput(
    request: DTO
  ): Promise<Either<Errors.CustomIdRequiredError, DTO>> {
    if (!request.customId) {
      return left(new Errors.CustomIdRequiredError());
    }

    return right(request);
  }

  private attachInvoiceId(context: UsecaseAuthorizationContext) {
    return async <T extends { customId: string }>(request: T) => {
      const usecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );

      return new AsyncEither(request.customId)
        .then((customId) => usecase.execute({ customId }, context))
        .map((result) => ({
          ...request,
          invoiceId: result.getValue()[0],
        }))
        .execute();
    };
  }

  private attachInvoice(context: UsecaseAuthorizationContext) {
    return async <T extends { invoiceId: InvoiceId }>(request: T) => {
      const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

      return new AsyncEither(request.invoiceId.id.toString())
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((result) => ({
          ...request,
          invoice: result.getValue(),
        }))
        .execute();
    };
  }

  private getTransaction(context: UsecaseAuthorizationContext) {
    return async (id: TransactionId) => {
      const usecase = new GetTransactionUsecase(this.transactionRepo);

      const result = await usecase.execute(
        { transactionId: id.id.toString() },
        context
      );

      if (result.isFailure) {
        return left<Errors.TransactionNotFoundError, Result<Transaction>>(
          new Errors.TransactionNotFoundError(id.id.toString())
        );
      }

      return right<Errors.TransactionNotFoundError, Result<Transaction>>(
        result
      );
    };
  }

  private attachTransaction(context: UsecaseAuthorizationContext) {
    return async <T extends { invoice: Invoice }>(request: T) => {
      return new AsyncEither(request.invoice.transactionId)
        .then(this.getTransaction(context))
        .map((result) => ({
          ...request,
          transaction: result.getValue(),
        }))
        .execute();
    };
  }
}
