// * Core Domain
import { Result, left, right, Either } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
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
    const a = new AsyncEither<
      AppError.UnexpectedError,
      MigrateEntireInvoiceDTO
    >(request);
    const maybeRequest = a.chain(request => validateRequest(request));
    return null;
  }

  private async getTransactionId(manuscriptId: string) {
    const invoiceIdByManuscriptCustomIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
      this.manuscriptRepo,
      this.invoiceItemRepo
    );
    const getInvoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

    const transactionIdExecution = new AsyncEither<null, string>(manuscriptId)
      .asyncChain(manuscriptId =>
        invoiceIdByManuscriptCustomIdUsecase.execute({
          customId: manuscriptId
        })
      )
      .map(invoiceIdsResponse => invoiceIdsResponse.getValue())
      .asyncChain(invoiceIds =>
        getInvoiceUsecase.execute({
          invoiceId: invoiceIds[0].id.toString()
        })
      )
      .map(invoiceResponse => invoiceResponse.getValue().transactionId);
    return transactionIdExecution.execute();
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
}
