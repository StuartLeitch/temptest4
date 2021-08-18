// * Core Domain
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
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
import type { GetTransactionDetailsByManuscriptCustomIdDTO as DTO } from './getTransactionDetailsByManuscriptCustomId.dto';
import * as Errors from './getTransactionDetailsByManuscriptCustomId.errors';

export class GetTransactionDetailsByManuscriptCustomIdUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract
  ) {
    super();

    this.attachTransaction = this.attachTransaction.bind(this);
    this.attachInvoiceId = this.attachInvoiceId.bind(this);
    this.getTransaction = this.getTransaction.bind(this);
    this.attachInvoice = this.attachInvoice.bind(this);
    this.verifyInput = this.verifyInput.bind(this);
  }

  @Authorize('transaction:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = await new AsyncEither(request)
        .then(this.verifyInput)
        .then(this.attachInvoiceId(context))
        .then(this.attachInvoice(context))
        .then(this.attachTransaction(context))
        .map((data) => data.transaction)
        .execute();

      return execution;
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

  private attachInvoiceId(context: Context) {
    return async <T extends { customId: string }>(request: T) => {
      const usecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );

      return new AsyncEither(request.customId)
        .then((customId) => usecase.execute({ customId }, context))
        .map((result) => ({
          ...request,
          invoiceId: result[0],
        }))
        .execute();
    };
  }

  private attachInvoice(context: Context) {
    return async <T extends { invoiceId: InvoiceId }>(request: T) => {
      const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

      return new AsyncEither(request.invoiceId.id.toString())
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((invoice) => ({
          ...request,
          invoice,
        }))
        .execute();
    };
  }

  private getTransaction(context: Context) {
    return async (id: TransactionId) => {
      const usecase = new GetTransactionUsecase(this.transactionRepo);

      const result = await usecase.execute(
        { transactionId: id.id.toString() },
        context
      );

      if (result.isLeft()) {
        return left<Errors.TransactionNotFoundError, Transaction>(
          new Errors.TransactionNotFoundError(id.id.toString())
        );
      }

      return right<Errors.TransactionNotFoundError, Transaction>(result.value);
    };
  }

  private attachTransaction(context: Context) {
    return async <T extends { invoice: Invoice }>(request: T) => {
      return new AsyncEither(request.invoice.transactionId)
        .then(this.getTransaction(context))
        .map((transaction) => ({
          ...request,
          transaction,
        }))
        .execute();
    };
  }
}
