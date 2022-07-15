import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UseCase } from '../../../../core/domain/UseCase';

import { right, left } from '../../../../core/logic/Either';
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AccessControlledUsecase, AccessControlContext, Authorize } from '../../../../domain/authorization';

import { LoggerContract } from '../../../../infrastructure/logging';

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { TransactionRepoContract } from '../../repos/transactionRepo';
import { CatalogRepoContract } from '../../../journals/repos';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { VATService } from '../../../../domain/services/VATService';
import { EmailService } from '../../../../infrastructure/communication-channels';

import { JournalId } from '../../../journals/domain/JournalId';
import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails';
import { SetTransactionStatusToActiveUsecase } from '../setTransactionStatusToActiveUsecase/setTransactionStatusToActiveUsecase';
import { SoftDeleteDraftTransactionUsecase } from '../softDeleteDraftTransaction';
import { UpdateTransactionOnTADecisionResponse as Response } from './updateTransactionOnTADecisionResponse';
import type { UpdateTransactionOnTADecisionDTO as DTO } from './updateTransactionOnTADecisionDTO';
import { UpdateTransactionOnTAUtils, Actions } from './ta-utils';
import * as Errors from './updateTransactionOnTADecisionErrors';
import { VError } from 'verror';
import { ManuscriptId } from '../../../manuscripts/domain/ManuscriptId';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Article } from '../../../manuscripts/domain/Article';

export class UpdateTransactionOnTADecisionUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  private manuscriptDetailsUsecase: GetManuscriptByInvoiceIdUsecase;
  private setTransactionStatusToActiveUsecase: SetTransactionStatusToActiveUsecase;
  private softDeleteDraftTransactionUsecase: SoftDeleteDraftTransactionUsecase;
  private taUsecaseUtils: UpdateTransactionOnTAUtils;
  private invoiceDetailsUsecase: GetInvoiceDetailsUsecase;

  constructor(
    private addressRepo: AddressRepoContract,
    private catalogRepo: CatalogRepoContract,
    private transactionRepo: TransactionRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private articleRepo: ArticleRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private couponRepo: CouponRepoContract,
    private emailService: EmailService,
    private vatService: VATService,
    private logger: LoggerContract
  ) {
    super();

    this.manuscriptDetailsUsecase = new GetManuscriptByInvoiceIdUsecase(this.articleRepo, this.invoiceItemRepo);

    this.softDeleteDraftTransactionUsecase = new SoftDeleteDraftTransactionUsecase(
      this.transactionRepo,
      this.invoiceItemRepo,
      this.invoiceRepo,
      this.articleRepo,
      this.logger
    );

    this.setTransactionStatusToActiveUsecase = new SetTransactionStatusToActiveUsecase(
      this.invoiceItemRepo,
      this.invoiceRepo,
      this.transactionRepo,
      this.logger
    );

    this.taUsecaseUtils = new UpdateTransactionOnTAUtils(
      this.invoiceItemRepo,
      this.transactionRepo,
      this.addressRepo,
      this.invoiceRepo,
      this.couponRepo,
      this.waiverRepo,
      this.payerRepo,
      this.logger,
      this.emailService,
      this.vatService
    );

    this.invoiceDetailsUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
  }

  @Authorize('transaction:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const manuscriptDetails = await this.getManuscriptDetails(request);
      const invoiceItem = await this.getInvoiceItems(manuscriptDetails, request);
      const journal = await this.getJournal(manuscriptDetails);
      const invoiceDetails = await this.getInvoiceDetails(request, context);
      //TODO maybe we should add a mapper which returns a populated invoice
      invoiceDetails.addInvoiceItem(invoiceItem);

      const actionResult = this.taUsecaseUtils.decideHowTheNextSubmissionStatusShouldChangeAccordingToCurrentFlags(
        manuscriptDetails.taEligible,
        manuscriptDetails.taFundingApproved,
        invoiceDetails.dateAccepted,
        manuscriptDetails.datePublished
      );

      // Update or Delete transaction based on TA combinations
      if (this.isActionToActivate(actionResult)) {
        this.logger.info('Attempting to update transaction.');
        const maybeUpdate = await this.setTransactionStatusToActiveUsecase.execute(
          { manuscriptId: request.manuscriptId },
          context
        );

        if (maybeUpdate.isLeft()) {
          return left(new Errors.TransactionNotUpdatedError());
        }

        // * Dispatch domain events
        invoiceDetails.generateCreatedEvent();
        DomainEvents.dispatchEventsForAggregate(invoiceDetails.id);

        // * If funds send a percentage, recalculate the amount
        if (request.discount) {
          invoiceItem.price = invoiceItem.calculateTADiscountedPrice(request.discount);
          invoiceDetails.generateInvoiceDraftAmountUpdatedEvent();
          DomainEvents.dispatchEventsForAggregate(invoiceDetails.id);
        }

        // *  Confirm Invoice
        await this.taUsecaseUtils.confirmInvoice(manuscriptDetails, invoiceDetails, context);

        // * Send emails
        await this.taUsecaseUtils.sendEmail(manuscriptDetails, invoiceDetails, journal, invoiceItem, request);
      }

      if (this.isActionToDelete(actionResult)) {
        this.logger.info(`Soft deleting invoice for ${request.submissionId}`);
        await this.softDeleteDraftTransactionUsecase.execute(
          {
            manuscriptId: request.submissionId,
          },
          context
        );
      }

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private isActionToDelete(actionResult: Actions) {
    return actionResult === Actions.Delete;
  }

  private isActionToActivate(actionResult: Actions) {
    return actionResult === Actions.Activate;
  }

  private async getJournal(manuscriptDetails) {
    try {
      // * System looks-up the catalog item for the manuscript
      const maybeCatalogItem = await this.catalogRepo.getCatalogItemByJournalId(
        JournalId.create(new UniqueEntityID(manuscriptDetails.journalId))
      );

      if (maybeCatalogItem.isLeft()) {
        this.logger.error(maybeCatalogItem.value.message, maybeCatalogItem.value);
        throw maybeCatalogItem.value;
      }

      return maybeCatalogItem.value;
    } catch (err) {
      const catalogItemNotFound = new Errors.CatalogItemNotFoundError(manuscriptDetails.invoiceId);
      throw new VError(catalogItemNotFound, 'Original error %s, %s', err.message, catalogItemNotFound.message);
    }
  }

  private async getInvoiceDetails(request, context) {
    try {
      const maybeInvoiceDetails = await this.invoiceDetailsUsecase.execute({ invoiceId: request.invoiceId }, context);
      if (maybeInvoiceDetails.isLeft()) {
        this.logger.error(maybeInvoiceDetails.value.message, maybeInvoiceDetails.value);
        throw maybeInvoiceDetails.value;
      }

      return maybeInvoiceDetails.value;
    } catch (err) {
      const invoiceNotFoundError = new Errors.InvoiceNotFoundError(request.invoiceId);
      throw new VError(invoiceNotFoundError, 'Original error %s, %s', err.message, invoiceNotFoundError.message);
    }
  }

  private async getInvoiceItems(manuscriptDetails, request) {
    // * System identifies invoice item by manuscript Id
    try {
      const maybeInvoiceItem = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(manuscriptDetails.manuscriptId);

      if (maybeInvoiceItem.isLeft()) {
        this.logger.error(maybeInvoiceItem.value.message, maybeInvoiceItem.value);
        throw maybeInvoiceItem.value;
      }
      return maybeInvoiceItem.value[0];
    } catch (err) {
      const invoiceItemNotFoundError = new Errors.InvoiceItemNotFoundError(request.invoiceId);
      throw new VError(
        invoiceItemNotFoundError,
        'Original error %s, %s',
        err.message,
        invoiceItemNotFoundError.message
      );
    }
  }

  private async getManuscriptDetails(request) {
    try {
      const manuscriptId = ManuscriptId.create(new UniqueEntityID(request.manuscriptId));
      // * System identifies manuscript by Id
      const maybeManuscript = await this.articleRepo.findById(manuscriptId);

      if (maybeManuscript.isLeft()) {
        this.logger.error(maybeManuscript.value.message, maybeManuscript.value);
        throw maybeManuscript.value;
      }

      return maybeManuscript.value;
    } catch (err) {
      const manuscriptNotFoundError = new Errors.ManuscriptNotFoundError(request.invoiceId);
      throw new VError(manuscriptNotFoundError, 'Original error %s, %s', err.message, manuscriptNotFoundError.message);
    }
  }
}
