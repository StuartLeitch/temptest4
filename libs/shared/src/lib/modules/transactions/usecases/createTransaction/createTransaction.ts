// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {TextUtil} from '../../../../utils/TextUtil';

import {
  Transaction,
  STATUS as TransactionStatus
} from '../../domain/Transaction';
import {TransactionRepoContract} from '../../repos/transactionRepo';
import {ArticleRepoContract} from '../../../articles/repos/articleRepo';
import {Article} from '../../../articles/domain/Article';
import {ArticleId} from '../../../articles/domain/ArticleId';
import {Invoice, InvoiceStatus} from './../../../invoices/domain/Invoice';
import {InvoiceItem} from './../../../invoices/domain/InvoiceItem';
import {InvoiceRepoContract} from './../../../invoices/repos/invoiceRepo';
import {InvoiceItemRepoContract} from './../../../invoices/repos/invoiceItemRepo';

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
      Result<Transaction>,
      CreateTransactionContext
    >,
    AccessControlledUsecase<
      CreateTransactionRequestDTO,
      CreateTransactionContext,
      AccessControlContext
    > {
  constructor(
    private transactionRepo: TransactionRepoContract,
    private articleRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract
  ) {
    this.transactionRepo = transactionRepo;
    this.articleRepo = articleRepo;
    this.invoiceRepo = invoiceRepo;
    this.invoiceItemRepo = invoiceItemRepo;
  }

  private async getArticle(
    request: CreateTransactionRequestDTO,
    context?: CreateTransactionContext
  ): Promise<Result<Article>> {
    const {
      manuscriptId,
      journalId,
      title,
      articleTypeId,
      authorEmail,
      authorCountry,
      authorSurname
    } = request;
    const isArticleIdProvided = TextUtil.isUUID(manuscriptId);

    if (isArticleIdProvided) {
      if (!manuscriptId) {
        return Result.fail<Article>(`Invalid manuscript id=${manuscriptId}`);
      }

      const article = await this.articleRepo.findById(manuscriptId);
      const found = !!article;

      if (found) {
        return Result.ok<Article>(article);
      } else {
        return Result.fail<Article>(
          `Couldn't find manuscript by id=${manuscriptId}`
        );
      }
    } else {
      const newArticleResult: Result<Article> = Article.create({
        journalId,
        title,
        articleTypeId,
        authorEmail,
        authorCountry,
        authorSurname
      });
      await this.articleRepo.save(newArticleResult.getValue());
      return newArticleResult;
    }
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:create')
  public async execute(
    request: CreateTransactionRequestDTO,
    context?: CreateTransactionContext
  ): Promise<Result<Transaction>> {
    const {manuscriptId: rawManuscriptId} = request;

    let manuscriptId: ArticleId;

    if ('manuscriptId' in request) {
      const articleOrError = await this.getArticle(request);
      if (articleOrError.isFailure) {
        return Result.fail<Transaction>(articleOrError.error);
      }
      manuscriptId = ArticleId.create(new UniqueEntityID(rawManuscriptId));
    }

    try {
      const transactionProps = {
        status: TransactionStatus.DRAFT
      } as any;

      if (manuscriptId) {
        transactionProps.manuscriptId = manuscriptId;
      }

      // * System creates DRAFT transaction
      const transactionOrError = Transaction.create(transactionProps);

      if (transactionOrError.isFailure) {
        return Result.fail<Transaction>(transactionOrError.error);
      }

      // This is where all the magic happens
      const transaction = transactionOrError.getValue();
      await this.transactionRepo.save(transaction);

      // * System creates DRAFT invoice
      const invoiceProps = {
        status: InvoiceStatus.DRAFT,
        transactionId: transaction.transactionId
      };

      const invoiceOrError = Invoice.create(invoiceProps);
      if (invoiceOrError.isFailure) {
        return Result.fail<Transaction>(invoiceOrError.error);
      }
      const invoice = invoiceOrError.getValue();
      await this.invoiceRepo.save(invoice);

      //* System creates invoice item(s)
      const invoiceItemProps = {
        invoiceId: invoice.invoiceId,
        dateCreated: new Date()
      };
      const invoiceItemOrError = InvoiceItem.create(invoiceItemProps);
      if (invoiceItemOrError.isFailure) {
        return Result.fail<Transaction>(invoiceItemOrError.error);
      }
      const invoiceItem = invoiceItemOrError.getValue();
      await this.invoiceItemRepo.save(invoiceItem);

      return Result.ok<Transaction>(transaction);
    } catch (err) {
      console.log(err);
      return Result.fail<Transaction>(err);
    }
  }
}
