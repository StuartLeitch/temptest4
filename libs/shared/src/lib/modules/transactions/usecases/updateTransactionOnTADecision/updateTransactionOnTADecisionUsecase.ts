import {DomainEvents} from '../../../../core/domain/events/DomainEvents';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {UseCase} from '../../../../core/domain/UseCase';

import {left, right} from '../../../../core/logic/Either';
import type {UsecaseAuthorizationContext as Context} from '../../../../domain/authorization';
import {AccessControlContext, AccessControlledUsecase, Authorize} from '../../../../domain/authorization';
import {UnexpectedError} from '../../../../core/logic/AppError';

import {LoggerContract} from '../../../../infrastructure/logging';

import {InvoiceItemRepoContract} from '../../../invoices/repos/invoiceItemRepo';
import {ArticleRepoContract} from '../../../manuscripts/repos/articleRepo';
import {InvoiceRepoContract} from '../../../invoices/repos/invoiceRepo';
import {TransactionRepoContract} from '../../repos/transactionRepo';
import {CatalogRepoContract} from '../../../journals/repos';
import {AddressRepoContract} from '../../../addresses/repos/addressRepo';
import {CouponRepoContract} from '../../../coupons/repos';
import {WaiverRepoContract} from '../../../waivers/repos';
import {PayerRepoContract} from '../../../payers/repos/payerRepo';
import {VATService} from '../../../../domain/services/VATService';
import {EmailService} from '../../../../infrastructure/communication-channels';

import {JournalId} from '../../../journals/domain/JournalId';
import {GetManuscriptByInvoiceIdUsecase} from '../../../manuscripts/usecases/getManuscriptByInvoiceId';

import {GetInvoiceDetailsUsecase} from '../../../invoices/usecases/getInvoiceDetails';
import {SetTransactionStatusToActiveUsecase} from '../setTransactionStatusToActiveUsecase/setTransactionStatusToActiveUsecase';
import {SoftDeleteDraftInvoiceUsecase} from '../softDeleteDraftTransaction';
import {UpdateTransactionOnTADecisionResponse as Response} from './updateTransactionOnTADecisionResponse';
import type {UpdateTransactionOnTADecisionDTO as DTO} from './updateTransactionOnTADecisionDTO';
import {Actions, UpdateTransactionOnTAUtils} from './ta-utils';
import * as Errors from './updateTransactionOnTADecisionErrors';
import {VError} from 'verror';
import {ManuscriptId} from '../../../manuscripts/domain/ManuscriptId';

export class UpdateTransactionOnTADecisionUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  private manuscriptDetailsUsecase: GetManuscriptByInvoiceIdUsecase;
  private setTransactionStatusToActiveUsecase: SetTransactionStatusToActiveUsecase;
  private softDeleteDraftInvoiceUsecase: SoftDeleteDraftInvoiceUsecase;
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

    this.softDeleteDraftInvoiceUsecase = new SoftDeleteDraftInvoiceUsecase(
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
      await this.invoiceItemRepo.update(invoiceItem)

      const actionResult = this.taUsecaseUtils.decideHowTheNextSubmissionStatusShouldChangeAccordingToCurrentFlags(
        manuscriptDetails.taEligible,
        manuscriptDetails.taFundingApproved,
        invoiceDetails.dateAccepted,
        manuscriptDetails.datePublished,
        invoiceDetails.status
      );
      // Update or Delete transaction based on TA combinations

      if (this.isActionToIgnore(actionResult)) {
        this.logger.info(`Ignoring transaction for invoice with id: ${invoiceDetails.invoiceId.toString()}`)
        return right(null)
      } else if (this.isActionToActivate(actionResult)) {
        this.logger.info('Attempting to update transaction.');

        // * If funds send a percentage, calculate the discounted price
        if (request.discount?.value) {
          invoiceItem.taDiscount = invoiceItem.calculateTADiscountedPrice(request.discount.value);
          invoiceItem.taCode = request.discount.taCode
          await this.invoiceItemRepo.update(invoiceItem)
          invoiceDetails.addInvoiceItem(invoiceItem);
          invoiceDetails.generateInvoiceDraftAmountUpdatedEvent();
          DomainEvents.dispatchEventsForAggregate(invoiceDetails.id);
        }

        //auto confirm invoice if the TA discounts have driven the price below 0
        const invoiceTotal = invoiceDetails.invoiceTotal;
        this.logger.info(`Total price for ${request.submissionId} is ${invoiceTotal}`)
        if(invoiceTotal <= 0){
          await this.taUsecaseUtils.confirmInvoice(manuscriptDetails, invoiceDetails, context)
        } else {
          const maybeUpdate = await this.setTransactionStatusToActiveUsecase.execute(
            {manuscriptId: request.manuscriptId},
            context
          );

          if (maybeUpdate.isLeft()) {
            return left(new Errors.TransactionNotUpdatedError());
          }

          // * Dispatch domain events
          invoiceDetails.generateCreatedEvent();
          DomainEvents.dispatchEventsForAggregate(invoiceDetails.id);

          // * Send emails
          await this.taUsecaseUtils.sendEmail(manuscriptDetails, invoiceDetails, journal, invoiceItem, request);
          return right(null)
        }
      } else if (this.isActionToDelete(actionResult)) {
        this.logger.info(`Soft deleting invoice for ${request.submissionId}`);
        await this.softDeleteDraftInvoiceUsecase.execute(
          {
            manuscriptId: request.submissionId,
          },
          context
        );
        return right(null);
      }
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

  private isActionToIgnore(actionResult: Actions) {
    return actionResult === Actions.Ignore
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
      const maybeInvoiceDetails = await this.invoiceDetailsUsecase.execute({invoiceId: request.invoiceId}, context);
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
