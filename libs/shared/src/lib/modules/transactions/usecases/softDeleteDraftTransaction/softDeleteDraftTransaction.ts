// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result, left} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {AppError} from '../../../../core/logic/AppError';

import {Invoice} from './../../../invoices/domain/Invoice';
import {InvoiceId} from './../../../invoices/domain/InvoiceId';
import {InvoiceItem} from './../../../invoices/domain/InvoiceItem';
import {ManuscriptId} from './../../../invoices/domain/ManuscriptId';
import {InvoiceRepoContract} from './../../../invoices/repos/invoiceRepo';
import {InvoiceItemRepoContract} from './../../../invoices/repos/invoiceItemRepo';
import {Transaction} from '../../domain/Transaction';
import {TransactionRepoContract} from '../../repos/transactionRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

export interface SoftDeleteDraftTransactionRequestDTO {
  manuscriptId: string;
}

export type DeleteTransactionContext = AuthorizationContext<Roles>;

export class SoftDeleteDraftTransactionUsecase
  implements
    UseCase<
      SoftDeleteDraftTransactionRequestDTO,
      Result<void>,
      DeleteTransactionContext
    >,
    AccessControlledUsecase<
      SoftDeleteDraftTransactionRequestDTO,
      DeleteTransactionContext,
      AccessControlContext
    > {
  constructor(
    private transactionRepo: TransactionRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private invoiceRepo: InvoiceRepoContract
  ) {
    this.transactionRepo = transactionRepo;
    this.invoiceItemRepo = invoiceItemRepo;
    this.invoiceRepo = invoiceRepo;
  }

  private async getInvoiceItemByManuscriptId(
    request: SoftDeleteDraftTransactionRequestDTO
  ): Promise<Result<InvoiceItem>> {
    const {manuscriptId} = request;

    if (!manuscriptId) {
      return Result.fail<InvoiceItem>(`Invalid Manuscript ID=${manuscriptId}`);
    }

    const invoiceItem = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(
      ManuscriptId.create(new UniqueEntityID(manuscriptId)).getValue()
    );
    const found = !!invoiceItem;

    if (found) {
      return Result.ok<InvoiceItem>(invoiceItem);
    } else {
      return Result.fail<InvoiceItem>(
        `Couldn't find Invoice Item by manuscript id=${manuscriptId}`
      );
    }
  }

  private async getInvoiceByInvoiceItemId(
    invoiceItemId
  ): Promise<Result<Invoice>> {
    if (!invoiceItemId) {
      return Result.fail<Invoice>(
        `Invalid Invoice Item Id=${invoiceItemId.id.toString()}`
      );
    }

    const invoice = await this.invoiceRepo.getInvoiceByInvoiceItemId(
      invoiceItemId
    );
    const found = !!invoice;

    if (found) {
      return Result.ok<Invoice>(invoice);
    } else {
      return Result.fail<Invoice>(
        `Couldn't find Invoice by Invoice Item id=${invoiceItemId.id.toString()}`
      );
    }
  }

  private async getTransactionByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Result<Transaction>> {
    if (!invoiceId) {
      return Result.fail<Transaction>(
        `Invalid Invoice Id=${invoiceId.id.toString()}`
      );
    }

    const transaction = await this.transactionRepo.getTransactionByInvoiceId(
      invoiceId
    );
    const found = !!transaction;

    if (found) {
      return Result.ok<Transaction>(transaction);
    } else {
      return Result.fail<Transaction>(
        `Couldn't find Transaction by Invoice id=${invoiceId.id.toString()}`
      );
    }
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:delete')
  public async execute(
    request: SoftDeleteDraftTransactionRequestDTO,
    context?: DeleteTransactionContext
  ): Promise<any> {
    try {
      // * System identifies invoice item by manuscript Id
      const invoiceItemOrError = await this.getInvoiceItemByManuscriptId(
        request
      );

      if (invoiceItemOrError.isFailure) {
        return Result.fail<Transaction>(invoiceItemOrError.error);
      }

      const invoiceItem: InvoiceItem = invoiceItemOrError.getValue();

      // * System identifies invoice by invoice item Id
      const invoiceOrError = await this.getInvoiceByInvoiceItemId(
        invoiceItem.invoiceItemId
      );

      if (invoiceOrError.isFailure) {
        return Result.fail<Transaction>(invoiceOrError.error);
      }

      const invoice: Invoice = invoiceOrError.getValue();

      // * System identifies transaction by invoice Id
      const transactionOrError = await this.getTransactionByInvoiceId(
        invoice.invoiceId
      );

      if (transactionOrError.isFailure) {
        return Result.fail<Transaction>(transactionOrError.error);
      }

      const transaction: Transaction = transactionOrError.getValue();

      // This is where all the magic happens
      // * System soft deletes transaction
      await this.transactionRepo.delete(transaction);
      await this.invoiceRepo.delete(invoice);
      await this.invoiceItemRepo.delete(invoiceItem);

      return Result.ok<void>();
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
