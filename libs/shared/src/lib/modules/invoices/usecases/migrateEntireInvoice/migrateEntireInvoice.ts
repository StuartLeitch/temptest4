// * Core Domain
import { Result, left, right, Either } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AsyncEither, all, asyncAll } from '../../../../core/logic/AsyncEither';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import { Invoice } from '../../domain/Invoice';

import { PublishInvoiceCreatedUsecase } from '../publishInvoiceCreated';
import { PublishInvoiceConfirmed } from '../publishInvoiceConfirmed';
import { PublishInvoicePaid } from '../publishInvoicePaid';

import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';
import { GetTransactionUsecase } from '../../../transactions/usecases/getTransaction/getTransaction';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';

import {
  STATUS as TransactionStatus,
  Transaction
} from '../../../transactions/domain/Transaction';
import { InvoiceStatus } from '../../domain/Invoice';
import { TransactionId } from '../../../transactions/domain/TransactionId';

// * Usecase specific
import { MigrateEntireInvoiceResponse } from './migrateEntireInvoiceResponse';
import { MigrateEntireInvoiceErrors } from './migrateEntireInvoiceErrors';
import { MigrateEntireInvoiceDTO } from './migrateEntireInvoiceDTO';

import { validateRequest } from './utils';

export type MigrateEntireInvoiceContext = AuthorizationContext<Roles>;

export class MigrateEntireInvoiceUsecase
  implements
    UseCase<
      MigrateEntireInvoiceDTO,
      Promise<MigrateEntireInvoiceResponse>,
      MigrateEntireInvoiceContext
    >,
    AccessControlledUsecase<
      MigrateEntireInvoiceDTO,
      MigrateEntireInvoiceContext,
      AccessControlContext
    > {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: MigrateEntireInvoiceDTO,
    context?: MigrateEntireInvoiceContext
  ): Promise<MigrateEntireInvoiceResponse> {
    const a = new AsyncEither<null, MigrateEntireInvoiceDTO>(request);
    const maybeInvoicesAndRequest = a
      .chain(request => validateRequest(request))
      .asyncChain(this.requestWithInvoices);
    const transactionExecution = maybeInvoicesAndRequest
      .map(({ request, invoices }) => ({
        acceptanceDate: request.acceptanceDate,
        invoices
      }))
      .asyncChain(this.updateTransactionStatusOfInvoice);
    const maybeTransaction = await transactionExecution.execute();
    return null;
  }

  private async requestWithInvoices(request: MigrateEntireInvoiceDTO) {
    return this.invoicesWithManuscriptCustomId(request.apc.manuscriptId).then(
      maybeInvoices => {
        return maybeInvoices.map(invoices => ({ invoices, request }));
      }
    );
  }

  private async invoicesWithManuscriptCustomId(customId: string) {
    const invoiceIdByManuscriptCustomIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
      this.manuscriptRepo,
      this.invoiceItemRepo
    );
    const getInvoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

    const customIdObj = { customId };

    const execution = new AsyncEither<null, { customId: string }>(customIdObj)
      .asyncChain(invoiceIdByManuscriptCustomIdUsecase.execute)
      .map(response => response.getValue())
      .asyncChain(invoiceIds => {
        return asyncAll(
          invoiceIds
            .map(id => ({ invoiceId: id.id.toString() }))
            .map(invoiceRequest => getInvoiceUsecase.execute(invoiceRequest))
        );
      })
      .map(invoices => invoices.map(invoice => invoice.getValue()));
    return execution.execute();
  }

  private getTransactionId(invoices: Invoice[]) {
    return invoices[0].transactionId;
  }

  private async getTransactionDetails(
    transactionId: TransactionId
  ): Promise<Either<MigrateEntireInvoiceErrors.TransactionError, Transaction>> {
    const usecase = new GetTransactionUsecase(this.transactionRepo);
    const response = await usecase.execute({
      transactionId: transactionId.id.toString()
    });
    if (response.isFailure) {
      const errorMessage = (response.errorValue() as unknown) as string;
      return left(
        new MigrateEntireInvoiceErrors.TransactionError(errorMessage)
      );
    }
    return right(response.getValue());
  }

  private async updateTransactionStatusOfInvoice({
    acceptanceDate,
    invoices
  }: {
    acceptanceDate: string;
    invoices: Invoice[];
  }) {
    const transactionId = this.getTransactionId(invoices);
    const execution = new AsyncEither<null, TransactionId>(transactionId)
      .asyncChain(this.getTransactionDetails)
      .asyncChain(transaction => {
        return this.updateTransactionStatus(acceptanceDate, transaction);
      });
    return execution.execute();
  }

  private async updateTransactionStatus(
    acceptanceDate: string,
    transaction: Transaction
  ): Promise<Either<AppError.UnexpectedError, Transaction>> {
    if (acceptanceDate) {
      transaction.markAsActive();
      try {
        const newTransaction = await this.transactionRepo.save(transaction);
        return right(newTransaction);
      } catch (err) {
        return left(new AppError.UnexpectedError(e));
      }
    }

    return right(transaction);
  }
}
