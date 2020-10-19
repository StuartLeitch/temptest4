/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { Invoice } from '../../../invoices/domain/Invoice';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { Transaction } from '../../domain/Transaction';
import { TransactionRepoContract } from '../../repos/transactionRepo';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { ArticleRepoContract as ManuscriptRepoContract } from '../../../manuscripts/repos/articleRepo';

import type { RestoreSoftDeleteDraftTransactionRequestDTO } from './restoreSoftDeleteDraftTransactionDTOs.ts';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { RestoreSoftDeleteDraftTransactionErrors } from './restoreSoftDeleteDraftTransactionErrors.ts';
import { RestoreSoftDeleteDraftTransactionResponse } from './restoreSoftDeleteDraftTransactionResponse';

export class RestoreSoftDeleteDraftTransactionUsecase
  implements
    UseCase<
      RestoreSoftDeleteDraftTransactionRequestDTO,
      Promise<RestoreSoftDeleteDraftTransactionResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      RestoreSoftDeleteDraftTransactionRequestDTO,
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

  @Authorize('transaction:restore')
  public async execute(
    request: RestoreSoftDeleteDraftTransactionRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<RestoreSoftDeleteDraftTransactionResponse> {
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
        return left(
          new RestoreSoftDeleteDraftTransactionErrors.InvoiceItemNotFoundError(
            request.manuscriptId
          )
        );
      }

      try {
        // * System identifies invoice item by manuscript Id
        [invoiceItem] = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(
          manuscriptId
        );
      } catch (err) {
        return left(
          new RestoreSoftDeleteDraftTransactionErrors.InvoiceItemNotFoundError(
            request.manuscriptId
          )
        );
      }

      try {
        // * System identifies invoice by invoice item Id
        invoice = await this.invoiceRepo.getInvoiceById(invoiceItem.invoiceId);
      } catch (err) {
        return left(
          new RestoreSoftDeleteDraftTransactionErrors.InvoiceNotFoundError(
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
          new RestoreSoftDeleteDraftTransactionErrors.TransactionNotFoundError(
            invoice.invoiceId.id.toString()
          )
        );
      }

      // This is where all the magic happens!

      // * System restores transaction
      await this.transactionRepo.restore(transaction);
      // * System restores invoice
      await this.invoiceRepo.restore(invoice);
      // * System restores invoice item
      await this.invoiceItemRepo.restore(invoiceItem);
      // * System restores manuscript
      await this.manuscriptRepo.restore(manuscript);

      return right(Result.ok<void>());
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
