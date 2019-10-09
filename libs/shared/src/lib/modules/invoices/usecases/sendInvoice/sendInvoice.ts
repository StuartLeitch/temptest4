// * Core Domain
import {Flow} from '../../../../core/domain/Flow';
import {Result} from '../../../../core/logic/Result';

import {Invoice /*, STATUS as InvoiceStatus */} from '../../domain/Invoice';
import {
  Transaction
  /*STATUS as TransactionStatus*/
} from '../../../transactions/domain/Transaction';
import {TransactionId} from '../../../transactions/domain/TransactionId';
import {TransactionRepoContract} from '../../../transactions/repos/transactionRepo';
import {InvoiceRepoContract} from '../../repos/invoiceRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

export interface SendInvoiceRequestDTO {
  manuscriptId?: string;
}

export type SendInvoiceContext = AuthorizationContext<Roles>;

export class SendInvoiceUsecase
  implements
    Flow<SendInvoiceRequestDTO, Result<Invoice>, SendInvoiceContext>,
    AccessControlledUsecase<
      SendInvoiceRequestDTO,
      SendInvoiceContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private transactionRepo: TransactionRepoContract
  ) {
    this.invoiceRepo = invoiceRepo;
    this.transactionRepo = transactionRepo;
  }

  private async getInvoiceForTransactionId(
    transactionId: TransactionId
  ): Promise<Result<Invoice>> {
    const [invoice] = await this.invoiceRepo.getInvoicesByTransactionId(
      transactionId
    );

    if (!invoice) {
      return Result.fail<Invoice>(
        `Couldn't find invoice by transactionId=${transactionId}`
      );
    }

    return Result.ok<Invoice>(invoice);
  }

  private async getTransactionForArticle(
    request: SendInvoiceRequestDTO
  ): Promise<Result<Transaction>> {
    let {manuscriptId} = request;

    const transaction = await this.transactionRepo.getTransactionByManuscriptId(
      manuscriptId
    );
    const found = !!transaction;

    if (found) {
      return Result.ok<Transaction>(transaction);
    } else {
      return Result.fail<Transaction>(
        `Couldn't find transaction of manuscript id=${manuscriptId}`
      );
    }
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:send')
  public async execute(
    request: SendInvoiceRequestDTO,
    context?: SendInvoiceContext
  ): Promise<Result<Invoice>> {
    try {
      // * System identifies the Transaction corresponding to this Article APC
      const transactionOrError = await this.getTransactionForArticle(request);

      if (transactionOrError.isFailure) {
        return Result.fail<Invoice>(transactionOrError.error);
      }

      const transaction = transactionOrError.getValue();

      // * System emails invoice link to submitting author
      const invoiceOrError = await this.getInvoiceForTransactionId(
        transaction.transactionId
      );
      if (invoiceOrError.isFailure) {
        return Result.fail<Invoice>(invoiceOrError.error);
      }
      const invoice = invoiceOrError.getValue();

      // magic happens here
      invoice.send();

      return Result.ok<Invoice>(null);
    } catch (err) {
      console.log(err);
      return Result.fail<Invoice>(err);
    }
  }
}
