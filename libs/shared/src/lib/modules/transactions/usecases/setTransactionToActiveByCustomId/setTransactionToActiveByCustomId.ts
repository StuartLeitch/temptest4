// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AppError } from '../../../../core/logic/AppError';

// * Authorization Logic
import {
  // Authorize,
  AuthorizationContext,
  AccessControlledUsecase
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';

import { CatalogRepoContract } from '../../../journals/repos';
import { CatalogItem } from '../../../journals/domain/CatalogItem';
import { JournalId } from '../../../journals/domain/JournalId';
import { Invoice } from '../../../invoices/domain/Invoice';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { TransactionRepoContract } from '../../repos/transactionRepo';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { InvoiceItemRepoContract } from './../../../invoices/repos/invoiceItemRepo';
import { WaiverService } from '../../../../domain/services/WaiverService';
import { EmailService } from '../../../../infrastructure/communication-channels';
import { Waiver } from '../../../../domain/reductions/Waiver';
import { Transaction } from '../../domain/Transaction';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { ManuscriptId } from './../../../invoices/domain/ManuscriptId';
import { WaiverRepoContract } from '../../../../domain/reductions/repos/waiverRepo';

// * Usecase specifics
import { SetTransactionToActiveByCustomIdResponse } from './setTransactionToActiveByCustomIdResponse';
import { SetTransactionToActiveByCustomIdErrors } from './setTransactionToActiveByCustomIdErrors';
import { SetTransactionToActiveByCustomIdDTO } from './setTransactionToActiveByCustomIdDTO';

export type SetTransactionToActiveByCustomIdContext = AuthorizationContext<
  Roles
>;

export class SetTransactionToActiveByCustomIdUsecase
  implements
    UseCase<
      SetTransactionToActiveByCustomIdDTO,
      Promise<SetTransactionToActiveByCustomIdResponse>,
      SetTransactionToActiveByCustomIdContext
    >,
    AccessControlledUsecase<
      SetTransactionToActiveByCustomIdDTO,
      SetTransactionToActiveByCustomIdContext,
      AccessControlContext
    > {
  constructor(
    private catalogRepo: CatalogRepoContract,
    private transactionRepo: TransactionRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private articleRepo: ArticleRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: SetTransactionToActiveByCustomIdDTO,
    context?: SetTransactionToActiveByCustomIdContext
  ): Promise<SetTransactionToActiveByCustomIdResponse> {
    let transaction: Transaction;
    let invoice: Invoice;
    let invoiceItem: InvoiceItem;
    let manuscript: Manuscript;
    let catalogItem: CatalogItem;

    try {
      try {
        // * System identifies manuscript by custom Id
        manuscript = await this.articleRepo.findByCustomId(request.customId);
      } catch (err) {
        return left(
          new SetTransactionToActiveByCustomIdErrors.ManuscriptNotFoundError(
            request.customId
          )
        );
      }

      // * get a proper ManuscriptId
      const manuscriptId = manuscript.manuscriptId;

      try {
        // * System identifies invoice item by manuscript Id
        invoiceItem = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(
          manuscriptId
        );
      } catch (err) {
        return left(
          new SetTransactionToActiveByCustomIdErrors.InvoiceItemNotFoundError(
            manuscriptId.id.toString()
          )
        );
      }

      try {
        // * System identifies invoice by invoice item Id
        invoice = await this.invoiceRepo.getInvoiceById(invoiceItem.invoiceId);
      } catch (err) {
        return left(
          new SetTransactionToActiveByCustomIdErrors.InvoiceNotFoundError(
            invoiceItem.invoiceId.id.toString()
          )
        );
      }

      try {
        // * System looks-up the transaction
        transaction = await this.transactionRepo.getTransactionById(
          invoice.transactionId
        );
      } catch (err) {
        return left(
          new SetTransactionToActiveByCustomIdErrors.TransactionNotFoundError(
            invoice.invoiceId.id.toString()
          )
        );
      }

      try {
        // * System looks-up the catalog item for the manuscript
        catalogItem = await this.catalogRepo.getCatalogItemByJournalId(
          JournalId.create(new UniqueEntityID(manuscript.journalId)).getValue()
        );
      } catch (err) {
        return left(
          new SetTransactionToActiveByCustomIdErrors.CatalogItemNotFoundError(
            manuscript.journalId
          )
        );
      }

      // * Mark transaction as ACTIVE
      transaction.markAsActive();

      await this.transactionRepo.update(transaction);
      await this.invoiceRepo.assignInvoiceNumber(invoice.invoiceId);

      return right(Result.ok<Transaction>(transaction));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
