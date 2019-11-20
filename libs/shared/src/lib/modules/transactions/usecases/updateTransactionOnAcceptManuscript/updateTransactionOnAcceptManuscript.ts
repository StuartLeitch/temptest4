// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AppError } from '../../../../core/logic/AppError';

import { Invoice } from '../../../invoices/domain/Invoice';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { TransactionRepoContract } from '../../repos/transactionRepo';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { InvoiceItemRepoContract } from './../../../invoices/repos/invoiceItemRepo';
import { WaiverService } from '../../../../domain/services/WaiverService';
import { Waiver } from '../../../../domain/reductions/Waiver';
import { Transaction } from '../../domain/Transaction';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { ManuscriptId } from './../../../invoices/domain/ManuscriptId';
import { WaiverRepoContract } from '../../../../domain/reductions/repos/waiverRepo';

// * Usecase specifics
import { UpdateTransactionOnAcceptManuscriptResponse } from './updateTransactionOnAcceptManuscriptResponse';
import { UpdateTransactionOnAcceptManuscriptErrors } from './updateTransactionOnAcceptManuscriptErrors';
import { UpdateTransactionOnAcceptManuscriptDTO } from './updateTransactionOnAcceptManuscriptDTOs';
// * Authorization Logic
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
  UpdateTransactionContext
} from './updateTransactionOnAcceptManuscriptAuthorizationContext';

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
    let manuscript: Manuscript;
    let waiver: Waiver;

    // * get a proper ManuscriptId
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
        // * System identifies invoice by invoice item Id
        invoice = await this.invoiceRepo.getInvoiceById(invoiceItem.invoiceId);
      } catch (err) {
        return left(
          new UpdateTransactionOnAcceptManuscriptErrors.InvoiceNotFoundError(
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
          new UpdateTransactionOnAcceptManuscriptErrors.TransactionNotFoundError(
            invoice.invoiceId.id.toString()
          )
        );
      }

      // * Mark transaction as ACTIVE
      transaction.markAsActive();

      // * get author details
      let { authorCountry } = manuscript;
      if (request.authorCountry) {
        manuscript.authorCountry = request.authorCountry;
        authorCountry = request.authorCountry;
      }

      if (request.customId) {
        manuscript.customId = request.customId;
      }

      if (request.title) {
        manuscript.title = request.title;
      }

      if (request.articleType) {
        manuscript.articleType = request.articleType;
      }

      if (request.authorEmail) {
        manuscript.authorEmail = request.authorEmail;
      }

      if (request.authorCountry) {
        manuscript.authorCountry = request.authorCountry;
      }

      if (request.authorSurname) {
        manuscript.authorSurname = request.authorSurname;
      }

      if (request.authorFirstName) {
        manuscript.authorFirstName = request.authorFirstName;
      }

      // * Identify applicable waiver(s)
      // TODO: Handle the case where multiple reductions are applied
      waiver = this.waiverService.applyWaivers({
        country: authorCountry
      });

      if (waiver) {
        // * associate waiver to the given invoice
        waiver.invoiceId = invoice.invoiceId;
        await this.waiverRepo.save(waiver);
      }

      await this.transactionRepo.update(transaction);
      await this.articleRepo.update(manuscript);

      return right(Result.ok<void>());
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
