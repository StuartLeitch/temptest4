// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AppError } from '../../../../core/logic/AppError';

// * Authorization Logic
import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';

import { Invoice } from '../../../invoices/domain/Invoice';
import { CatalogItem } from './../../../journals/domain/CatalogItem';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { TransactionRepoContract } from '../../repos/transactionRepo';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { InvoiceItemRepoContract } from './../../../invoices/repos/invoiceItemRepo';
import { WaiverService } from '../../../../domain/services/WaiverService';
import { Waiver } from '../../../../domain/reductions/Waiver';
import { WaiverMap } from '../../../../domain/reductions/mappers/WaiverMap';
import { Transaction } from '../../domain/Transaction';
import { Article } from '../../../manuscripts/domain/Article';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { ManuscriptId } from './../../../invoices/domain/ManuscriptId';
import { CatalogRepoContract } from './../../../journals/repos/catalogRepo';
import { WaiverRepoContract } from '../../../../domain/reductions/repos/waiverRepo';
import { JournalId } from './../../../journals/domain/JournalId';

// * Usecase specific
import { UpdateTransactionOnAcceptManuscriptResponse } from './updateTransactionOnAcceptManuscriptResponse';
import { UpdateTransactionOnAcceptManuscriptErrors } from './updateTransactionOnAcceptManuscriptErrors';
import { UpdateTransactionOnAcceptManuscriptDTO } from './updateTransactionOnAcceptManuscriptDTOs';

export type UpdateTransactionContext = AuthorizationContext<Roles>;

export class UpdateTransactionOnAcceptManuscriptUsecase
  implements
    UseCase<
      UpdateTransactionOnAcceptManuscriptDTO,
      Promise<UpdateTransactionOnAcceptManuscriptResponse>,
      UpdateTransactionContext
    >,
    AccessControlledUsecase<
      UpdateTransactionOnAcceptManuscriptDTO,
      UpdateTransactionContext,
      AccessControlContext
    > {
  constructor(
    private transactionRepo: TransactionRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private catalogRepo: CatalogRepoContract,
    private articleRepo: ArticleRepoContract,
    private waiverRepo: WaiverRepoContract,
    private waiverService: WaiverService
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:update')
  public async execute(
    request: UpdateTransactionOnAcceptManuscriptDTO,
    context?: UpdateTransactionContext
  ): Promise<UpdateTransactionOnAcceptManuscriptResponse> {
    let transaction: Transaction;
    let invoice: Invoice;
    let invoiceItem: InvoiceItem;
    let catalogItem: CatalogItem;
    let manuscript: Article;
    let waiver: Waiver;

    // * get a proper ManuscriptId
    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    ).getValue();

    // * get a proper JournalId
    const journalId = JournalId.create(
      new UniqueEntityID(request.journalId)
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
        catalogItem = await this.catalogRepo.getCatalogItemByJournalId(
          journalId
        );
      } catch (err) {
        return left(
          new UpdateTransactionOnAcceptManuscriptErrors.CatalogItemNotFoundError(
            journalId.id.toString()
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

      // * Mark transaction as ACTIVE
      transaction.markAsActive();

      // * get author details
      const { authorCountry } = manuscript;

      // * Identify applicable waiver(s)
      // TODO: Handle the case where multiple reductions are applied
      waiver = this.waiverService.applyWaivers({
        country: authorCountry
      });

      // * associate waiver to the given invoice
      waiver.invoiceId = invoice.invoiceId;
      await this.waiverRepo.save(waiver);

      // * apply waiver to the invoice through invoice item
      invoiceItem.price = catalogItem.amount * Number(waiver.percentage);

      await this.invoiceItemRepo.save(invoiceItem);

      return right(Result.ok<void>());
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
