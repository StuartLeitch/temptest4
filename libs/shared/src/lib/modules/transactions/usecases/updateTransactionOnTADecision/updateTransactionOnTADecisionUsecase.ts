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
import {InvoiceItem} from "../../../invoices/domain/InvoiceItem";
import {Invoice} from "../../../invoices/domain/Invoice";
import {Manuscript} from "../../../manuscripts/domain/Manuscript";
import {WaiverService} from '../../../../domain/services/WaiverService';
import {UpdateTransactionOnTADecisionDTO} from "./updateTransactionOnTADecisionDTO";
import {GetItemsForInvoiceUsecase} from "../../../invoices/usecases/getItemsForInvoice";
import {AddressMap} from "../../../addresses/mappers/AddressMap";
import {PayerMap} from "../../../payers/mapper/Payer";
import {PayerType} from "../../../payers/domain/Payer";
import {ConfirmInvoiceDTO, ConfirmInvoiceUsecase} from "../../../invoices/usecases/confirmInvoice";

;

export class UpdateTransactionOnTADecisionUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  private manuscriptDetailsUsecase: GetManuscriptByInvoiceIdUsecase;
  private setTransactionStatusToActiveUsecase: SetTransactionStatusToActiveUsecase;
  private softDeleteDraftInvoiceUsecase: SoftDeleteDraftInvoiceUsecase;
  private taUsecaseUtils: UpdateTransactionOnTAUtils;
  private invoiceDetailsUsecase: GetInvoiceDetailsUsecase;
  private invoiceItemsUsecase: GetItemsForInvoiceUsecase;
  private confirmInvoiceUsecase: ConfirmInvoiceUsecase;

  constructor(
    private addressRepo: AddressRepoContract,
    private catalogRepo: CatalogRepoContract,
    private transactionRepo: TransactionRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private articleRepo: ArticleRepoContract,
    private waiverRepo: WaiverRepoContract,
    private waiverService: WaiverService,
    private payerRepo: PayerRepoContract,
    private couponRepo: CouponRepoContract,
    private emailService: EmailService,
    private vatService: VATService,
    private logger: LoggerContract
  ) {
    super();

    this.manuscriptDetailsUsecase = new GetManuscriptByInvoiceIdUsecase(this.articleRepo, this.invoiceItemRepo);
    this.invoiceItemsUsecase = new GetItemsForInvoiceUsecase(this.invoiceItemRepo, this.couponRepo, this.waiverRepo);

    this.confirmInvoiceUsecase = new ConfirmInvoiceUsecase(
      this.invoiceItemRepo,
      this.transactionRepo,
      this.addressRepo,
      this.invoiceRepo,
      this.couponRepo,
      this.waiverRepo,
      this.payerRepo,
      this.logger,
      this.vatService
    );

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
      const { sanctionedCountryNotificationReceiver, sanctionedCountryNotificationSender } = request;

      const manuscriptDetails = await this.getManuscriptDetails(request);
      const invoiceItem = await this.getInvoiceItems(manuscriptDetails, request);
      const journal = await this.getJournal(manuscriptDetails);
      const invoiceDetails = await this.getInvoiceDetails(request, context);
      //TODO maybe we should add a mapper which returns a populated invoice
      invoiceDetails.addInvoiceItem(invoiceItem);

      invoiceItem.taCode = request.discount?.taCode
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

        // * If funds send a percentage, calculate the discounted price
        if (request.discount?.value) {
          invoiceItem.taDiscount = invoiceItem.calculateTADiscountedPrice(request.discount.value);
          await this.invoiceItemRepo.update(invoiceItem)

          await this.calculateWaivers(invoiceItem, invoiceDetails, request, manuscriptDetails);

          const itemsWithReductions = await this.invoiceItemsUsecase.execute({ invoiceId: invoiceDetails.id.toString() }, context);

          if (itemsWithReductions.isLeft()) {
            return itemsWithReductions.map(() => null);
          }

          invoiceDetails.addItems(itemsWithReductions.value);

          invoiceDetails.generateInvoiceDraftAmountUpdatedEvent();
          DomainEvents.dispatchEventsForAggregate(invoiceDetails.id);

          const total = invoiceDetails.invoiceTotal;
          // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
          if (total <= 0) {
            // * but we can auto-confirm it
            // * create new address
            const maybeNewAddress = AddressMap.toDomain({
              country: manuscriptDetails.authorCountry,
            });

            if (maybeNewAddress.isLeft()) {
              return left(new UnexpectedError(new Error(maybeNewAddress.value.message)));
            }

            // * create new payer
            const maybeNewPayer = PayerMap.toDomain({
              invoiceId: invoiceDetails.invoiceId.id.toString(),
              name: `${manuscriptDetails.authorFirstName} ${manuscriptDetails.authorSurname}`,
              addressId: maybeNewAddress.value.addressId.id.toString(),
              email: manuscriptDetails.authorEmail,
              type: PayerType.INDIVIDUAL,
              organization: ' ',
            });

            if (maybeNewPayer.isLeft()) {
              return left(new UnexpectedError(new Error(maybeNewPayer.value.message)));
            }

            const confirmInvoiceArgs: ConfirmInvoiceDTO = {
              payer: {
                ...PayerMap.toPersistence(maybeNewPayer.value),
                address: AddressMap.toPersistence(maybeNewAddress.value),
              },
              sanctionedCountryNotificationReceiver,
              sanctionedCountryNotificationSender,
            };

            // * Confirm the invoice automagically
            try {
              const maybeConfirmed = await this.confirmInvoiceUsecase.execute(confirmInvoiceArgs, context);
              if (maybeConfirmed.isLeft()) {
                return maybeConfirmed.map(() => null);
              }
            } catch (err) {
              return left(new UnexpectedError(err));
            }
            return right(null);
          }
        }

        // * Send emails
        await this.taUsecaseUtils.sendEmail(manuscriptDetails, invoiceDetails, journal, invoiceItem, request);
        return right(null)
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

  private async calculateWaivers(
    invoiceItem: InvoiceItem,
    invoice: Invoice,
    request: UpdateTransactionOnTADecisionDTO,
    manuscript: Manuscript
  ) {
    try {
      await this.waiverRepo.removeInvoiceItemWaivers(invoiceItem.invoiceItemId);
      await this.waiverService.applyWaiver({
        invoiceId: invoice.invoiceId.id.toString(),
        allAuthorsEmails: request.authorEmails,
        country: manuscript.authorCountry,
        journalId: manuscript.journalId,
      });
    } catch (error) {
      return left(
        new UnexpectedError(new Error(`Failed to save waiver due to error: ${error.message}: ${error.stack}`))
      );
    }
  }
}
