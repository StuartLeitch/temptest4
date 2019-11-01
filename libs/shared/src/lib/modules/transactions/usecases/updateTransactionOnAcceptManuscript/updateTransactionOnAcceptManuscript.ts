// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result, left, right} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {AppError} from '../../../../core/logic/AppError';
import {UpdateTransactionOnAcceptManuscriptResponse} from './updateTransactionOnAcceptManuscriptResponse';
import {UpdateTransactionOnAcceptManuscriptErrors} from './updateTransactionOnAcceptManuscriptErrors';

import {Invoice} from '../../../invoices/domain/Invoice';
import {CatalogItem} from './../../../catalogs/domain/CatalogItem';
import {InvoiceItem} from '../../../invoices/domain/InvoiceItem';
import {TransactionRepoContract} from '../../repos/transactionRepo';
import {InvoiceRepoContract} from './../../../invoices/repos/invoiceRepo';
import {InvoiceItemRepoContract} from './../../../invoices/repos/invoiceItemRepo';
import {WaiverService} from '../../../../domain/services/WaiverService';
import {Transaction} from '../../domain/Transaction';
import {Article} from '../../../articles/domain/Article';
import {ArticleRepoContract} from './../../../articles/repos/articleRepo';
import {ManuscriptId} from './../../../invoices/domain/ManuscriptId';
import {CatalogRepoContract} from './../../../catalogs/repos/catalogRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

export interface UpdateTransactionRequestDTO {
  manuscriptId: string;
}

export type UpdateTransactionContext = AuthorizationContext<Roles>;

export class UpdateTransactionOnAcceptManuscriptUsecase
  implements
    UseCase<
      UpdateTransactionRequestDTO,
      Promise<UpdateTransactionOnAcceptManuscriptResponse>,
      UpdateTransactionContext
    >,
    AccessControlledUsecase<
      UpdateTransactionRequestDTO,
      UpdateTransactionContext,
      AccessControlContext
    > {
  constructor(
    private transactionRepo: TransactionRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private catalogRepo: CatalogRepoContract,
    private articleRepo: ArticleRepoContract,
    private waiverService: WaiverService
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:update')
  public async execute(
    request: UpdateTransactionRequestDTO,
    context?: UpdateTransactionContext
  ): Promise<UpdateTransactionOnAcceptManuscriptResponse> {
    let transaction: Transaction;
    let invoice: Invoice;
    let invoiceItem: InvoiceItem;
    let catalogItem: CatalogItem;
    let manuscript: Article;

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    ).getValue();

    try {
      try {
        // * System identifies manuscript by Id
        manuscript = await this.articleRepo.findById(manuscriptId);
      } catch (err) {
        return left(
          new UpdateTransactionOnAcceptManuscriptErrors.ManuscriptNotFoundError(
            request.manuscriptId
          )
        );
      }

      try {
        // * System identifies invoice item by manuscript Id
        invoiceItem = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(
          manuscriptId
        );
      } catch (err) {
        return left(
          new UpdateTransactionOnAcceptManuscriptErrors.InvoiceItemNotFoundError(
            request.manuscriptId
          )
        );
      }

      try {
        // * System identifies catalog item
        catalogItem = await this.catalogRepo.getCatalogItemByType(
          invoiceItem.type
        );
      } catch (err) {
        return left(
          new UpdateTransactionOnAcceptManuscriptErrors.CatalogItemNotFoundError(
            invoiceItem.type
          )
        );
      }

      try {
        // * System identifies invoice by invoice item Id
        invoice = await this.invoiceRepo.getInvoiceByInvoiceItemId(
          invoiceItem.invoiceItemId
        );
      } catch (err) {
        return left(
          new UpdateTransactionOnAcceptManuscriptErrors.InvoiceNotFoundError(
            invoiceItem.invoiceId.id.toString()
          )
        );
      }

      try {
        // * System looks-up the transaction
        transaction = await this.transactionRepo.getTransactionByInvoiceId(
          invoice.invoiceId
        );
      } catch (err) {
        return left(
          new UpdateTransactionOnAcceptManuscriptErrors.TransactionNotFoundError(
            invoice.invoiceId.id.toString()
          )
        );
      }

      // * this is where the magic happens
      invoice.addInvoiceItem(invoiceItem);
      transaction.addInvoice(invoice);
      const {price} = catalogItem;

      // * get author details
      const {authorCountry} = manuscript;

      // apply waivers
      const reduction = this.waiverService.applyWaivers({
        country: authorCountry
      });

      // * update invoice item price after waivers applied
      invoiceItem.price = price * reduction.percentage;

      await this.invoiceItemRepo.save(invoiceItem);

      return right(Result.ok<void>());
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
