/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { Invoice } from './../../../invoices/domain/Invoice';
import { InvoiceItem } from './../../../invoices/domain/InvoiceItem';
import { ManuscriptId } from './../../../invoices/domain/ManuscriptId';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { InvoiceItemRepoContract } from './../../../invoices/repos/invoiceItemRepo';
import { Transaction } from '../../domain/Transaction';
import { TransactionRepoContract } from '../../repos/transactionRepo';
import { Manuscript } from './../../../manuscripts/domain/Manuscript';
import { ArticleRepoContract as ManuscriptRepoContract } from './../../../manuscripts/repos/articleRepo';

import type { SoftDeleteDraftTransactionRequestDTO } from './softDeleteDraftTransactionDTOs';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import * as Errors from './softDeleteDraftTransactionErrors';
import { SoftDeleteDraftTransactionResponse } from './softDeleteDraftTransactionResponse';

export class SoftDeleteDraftTransactionUsecase
  implements
    UseCase<
      SoftDeleteDraftTransactionRequestDTO,
      Promise<SoftDeleteDraftTransactionResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      SoftDeleteDraftTransactionRequestDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private transactionRepo: TransactionRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private manuscriptRepo: ManuscriptRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:delete')
  public async execute(
    request: SoftDeleteDraftTransactionRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<SoftDeleteDraftTransactionResponse> {
    let invoiceItem: InvoiceItem;
    let invoice: Invoice;
    let transaction: Transaction;
    let manuscript: Manuscript;

    // * build the ManuscriptId
    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    ).getValue();

    try {
      try {
        // * System identifies article by manuscript Id
        manuscript = await this.manuscriptRepo.findById(manuscriptId);
      } catch (err) {
        return left(new Errors.InvoiceItemNotFoundError(request.manuscriptId));
      }

      try {
        // * System identifies invoice item by manuscript Id
        [invoiceItem] = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(
          manuscriptId
        );
      } catch (err) {
        return left(new Errors.InvoiceItemNotFoundError(request.manuscriptId));
      }

      try {
        // * System identifies invoice by invoice item Id
        invoice = await this.invoiceRepo.getInvoiceById(invoiceItem.invoiceId);
      } catch (err) {
        return left(
          new Errors.InvoiceNotFoundError(
            invoiceItem.invoiceItemId.id.toString()
          )
        );
      }

      try {
        // * System identifies transaction by invoice Id
        transaction = await this.transactionRepo.getTransactionById(
          invoice.transactionId
        );
      } catch (err) {
        return left(
          new Errors.TransactionNotFoundError(invoice.invoiceId.id.toString())
        );
      }

      // This is where all the magic happens!

      // * System soft deletes transaction
      await this.transactionRepo.delete(transaction);
      // * System soft deletes invoice
      await this.invoiceRepo.delete(invoice);
      // * System soft deletes invoice item
      await this.invoiceItemRepo.delete(invoiceItem);
      // * System soft deletes manuscript
      await this.manuscriptRepo.delete(manuscript);

      invoice.generateInvoiceDraftDeletedEvent();
      DomainEvents.dispatchEventsForAggregate(invoice.id);

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
