// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {Invoice, STATUS as InvoiceStatus} from '../../domain/Invoice';
import {InvoiceRepoContract} from '../../repos/invoiceRepo';
import {TransactionRepoContract} from '../../../transactions/repos/transactionRepo';
import {Transaction} from '../../../transactions/domain/Transaction';
import {TransactionId} from '../../../transactions/domain/TransactionId';
import {
  Authorize,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

export interface CreateInvoiceRequestDTO {
  transactionId?: string;
}

export type CreateInvoiceContext = AuthorizationContext<Roles>;

export class CreateInvoiceUsecase
  implements
    UseCase<CreateInvoiceRequestDTO, Result<Invoice>, CreateInvoiceContext> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private transactionRepo: TransactionRepoContract
  ) {
    this.invoiceRepo = invoiceRepo;
    this.transactionRepo = transactionRepo;
  }

  private async getTransaction(
    request: CreateInvoiceRequestDTO
  ): Promise<Result<Transaction>> {
    const {transactionId} = request;
    if (!transactionId) {
      return Result.fail<Transaction>(
        `Invalid transaction id=${transactionId}`
      );
    }

    const transaction = await this.transactionRepo.getTransactionById(
      TransactionId.create(new UniqueEntityID(transactionId))
    );
    const found = !!transaction;

    if (found) {
      return Result.ok<Transaction>(transaction);
    } else {
      return Result.fail<Transaction>(
        `Couldn't find transaction by id=${transactionId}`
      );
    }
  }

  public async getAccessControlContext(
    request: CreateInvoiceRequestDTO,
    context?: CreateInvoiceContext
  ): Promise<AccessControlContext> {
    return {};
  }

  @Authorize('create:invoice')
  public async execute(
    request: CreateInvoiceRequestDTO,
    context?: CreateInvoiceContext
  ): Promise<Result<Invoice>> {
    let {transactionId: rawTransactionId} = request;

    let transactionId: TransactionId;

    if ('transactionId' in request) {
      const transactionOrError = await this.getTransaction(request);
      if (transactionOrError.isFailure) {
        return Result.fail<Invoice>(transactionOrError.error);
      }
      transactionId = TransactionId.create(
        new UniqueEntityID(rawTransactionId)
      );
    }

    try {
      const invoiceProps = {
        status: InvoiceStatus.DRAFT
      } as any;
      if (transactionId) {
        invoiceProps.transactionId = transactionId;
      }

      // * System creates DRAFT invoice
      const invoiceOrError = Invoice.create(invoiceProps);

      if (invoiceOrError.isFailure) {
        return Result.fail<Invoice>(invoiceOrError.error);
      }

      // This is where all the magic happens
      const invoice = invoiceOrError.getValue();
      await this.invoiceRepo.save(invoice);

      return Result.ok<Invoice>(invoice);
    } catch (err) {
      console.log(err);
      return Result.fail<Invoice>(err);
    }
  }
}
