// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result, left, right} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {TextUtil} from '../../../../utils/TextUtil';

import {AppError} from '../../../../core/logic/AppError';
import {CreateTransactionResponse} from './createTransactionResponse';
import {CreateTransactionErrors} from './createTransactionErrors';

import {
  Transaction,
  STATUS as TransactionStatus
} from '../../domain/Transaction';
import {TransactionRepoContract} from '../../repos/transactionRepo';
import {ArticleRepoContract} from '../../../articles/repos/articleRepo';
import {Article} from '../../../articles/domain/Article';
import {JournalId} from './../../../catalogs/domain/JournalId';
// import {ArticleId} from '../../../articles/domain/ArticleId';
import {CatalogItem} from './../../../catalogs/domain/CatalogItem';
import {Invoice, InvoiceStatus} from './../../../invoices/domain/Invoice';
import {InvoiceItem} from './../../../invoices/domain/InvoiceItem';
import {InvoiceRepoContract} from './../../../invoices/repos/invoiceRepo';
import {InvoiceItemRepoContract} from './../../../invoices/repos/invoiceItemRepo';
import {ManuscriptId} from '../../../invoices/domain/ManuscriptId';
import {CatalogRepoContract} from './../../../catalogs/repos/catalogRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

export interface CreateTransactionRequestDTO {
  manuscriptId?: string;
  journalId?: string;
  title?: string;
  articleTypeId?: string;
  created?: string;
  authorEmail?: string;
  authorCountry?: string;
  authorSurname?: string;
}

export type CreateTransactionContext = AuthorizationContext<Roles>;

export class CreateTransactionUsecase
  implements
    UseCase<
      CreateTransactionRequestDTO,
      Promise<CreateTransactionResponse>,
      CreateTransactionContext
    >,
    AccessControlledUsecase<
      CreateTransactionRequestDTO,
      CreateTransactionContext,
      AccessControlContext
    > {
  constructor(
    private transactionRepo: TransactionRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private catalogRepo: CatalogRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:create')
  public async execute(
    request: CreateTransactionRequestDTO,
    context?: CreateTransactionContext
  ): Promise<CreateTransactionResponse> {
    let catalogItem: CatalogItem;

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    ).getValue();
    const journalId = JournalId.create(
      new UniqueEntityID(request.journalId)
    ).getValue();

    const transactionProps = {
      status: TransactionStatus.DRAFT
    } as any;

    try {
      // * System creates DRAFT transaction
      const transactionOrError = Transaction.create(transactionProps);
      if (transactionOrError.isFailure) {
        return left(new CreateTransactionErrors.TransactionCreatedError());
      }

      const transaction = transactionOrError.getValue();
      await this.transactionRepo.save(transaction);

      // * System creates DRAFT invoice
      const invoiceProps = {
        status: InvoiceStatus.DRAFT,
        transactionId: transaction.transactionId
      };

      const invoiceOrError = Invoice.create(invoiceProps);
      if (invoiceOrError.isFailure) {
        return left(new CreateTransactionErrors.InvoiceCreatedError());
      }
      const invoice = invoiceOrError.getValue();
      await this.invoiceRepo.save(invoice);

      //* System creates invoice item(s)
      const invoiceItemProps = {
        manuscriptId,
        invoiceId: invoice.invoiceId,
        dateCreated: new Date()
      };

      const invoiceItemOrError = InvoiceItem.create(invoiceItemProps);
      if (invoiceItemOrError.isFailure) {
        return left(new CreateTransactionErrors.InvoiceItemCreatedError());
      }
      const invoiceItem = invoiceItemOrError.getValue();

      try {
        // * System identifies catalog item
        catalogItem = await this.catalogRepo.getCatalogItemByJournalId(
          journalId
        );
      } catch (err) {
        return left(
          new CreateTransactionErrors.CatalogItemNotFoundError(
            journalId.id.toString()
          )
        );
      }

      const {price} = catalogItem;

      // * Set price for the Invoice Item
      invoiceItem.price = price;

      await this.invoiceItemRepo.save(invoiceItem);

      return right(Result.ok<Transaction>(transaction));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
