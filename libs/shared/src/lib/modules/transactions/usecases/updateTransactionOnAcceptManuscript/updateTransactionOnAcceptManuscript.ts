// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import { AccessControlledUsecase, AccessControlContext, Authorize } from '../../../../domain/authorization';

import { EmailService } from '../../../../infrastructure/communication-channels';
import { WaiverService } from '../../../../domain/services/WaiverService';
import { LoggerContract } from '../../../../infrastructure/logging';
import { VATService } from '../../../../domain/services/VATService';

import { ManuscriptId } from './../../../manuscripts/domain/ManuscriptId';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { JournalId } from '../../../journals/domain/JournalId';
import { Invoice } from '../../../invoices/domain/Invoice';
import { PayerType } from '../../../payers/domain/Payer';
import { Transaction } from '../../domain/Transaction';

import { AddressMap } from '../../../addresses/mappers/AddressMap';
import { PayerMap } from '../../../payers/mapper/Payer';

import { InvoiceItemRepoContract } from './../../../invoices/repos/invoiceItemRepo';
import { AddressRepoContract } from './../../../addresses/repos/addressRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { TransactionRepoContract } from '../../repos/transactionRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { CatalogRepoContract } from '../../../journals/repos';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import { GetItemsForInvoiceUsecase } from '../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { ConfirmInvoiceUsecase, ConfirmInvoiceDTO } from '../../../invoices/usecases/confirmInvoice';

// * Usecase specifics
import { UpdateTransactionOnAcceptManuscriptResponse as Response } from './updateTransactionOnAcceptManuscriptResponse';
import type {
  UpdateTransactionOnAcceptManuscriptDTO,
  UpdateTransactionOnAcceptManuscriptDTO as DTO,
} from './updateTransactionOnAcceptManuscriptDTO';
import * as Errors from './updateTransactionOnAcceptManuscriptErrors';
import { VError } from 'verror';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';

export class UpdateTransactionOnAcceptManuscriptUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
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

    this.invoiceDetailsUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
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
  }

  @Authorize('transaction:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const { sanctionedCountryNotificationReceiver, sanctionedCountryNotificationSender } = request;

      const manuscript = await this.getManuscriptDetails(request);
      const invoiceItem = await this.getInvoiceItems(manuscript, request);
      const catalogItem = await this.getJournal(manuscript);
      const invoice = await this.getInvoiceDetails(invoiceItem, context);
      const transaction = await this.getTransaction(invoice);
      //TODO maybe we should add a mapper which returns a populated invoice
      invoice.addInvoiceItem(invoiceItem);

      // * Mark transaction as ACTIVE
      await this.activateTransaction(transaction);

      await this.calculateWaivers(invoiceItem, invoice, request, manuscript);

      await this.updateInvoiceDateAccepted(invoice, request);
      invoice.generateCreatedEvent();
      DomainEvents.dispatchEventsForAggregate(invoice.id);

      const itemsWithReductions = await this.invoiceItemsUsecase.execute({ invoiceId: invoice.id.toString() }, context);

      if (itemsWithReductions.isLeft()) {
        return itemsWithReductions.map(() => null);
      }

      invoice.addItems(itemsWithReductions.value);
      const total = invoice.invoiceTotal;

      // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
      if (total <= 0) {
        // * but we can auto-confirm it
        // * create new address
        const maybeNewAddress = AddressMap.toDomain({
          country: manuscript.authorCountry,
        });

        if (maybeNewAddress.isLeft()) {
          return left(new UnexpectedError(new Error(maybeNewAddress.value.message)));
        }

        // * create new payer
        const maybeNewPayer = PayerMap.toDomain({
          invoiceId: invoice.invoiceId.id.toString(),
          name: `${manuscript.authorFirstName} ${manuscript.authorSurname}`,
          addressId: maybeNewAddress.value.addressId.id.toString(),
          email: manuscript.authorEmail,
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

      await this.emailService
        .createInvoicePaymentTemplate(
          manuscript,
          catalogItem,
          invoiceItem,
          invoice,
          request.bankTransferCopyReceiver,
          request.emailSenderInfo.address,
          request.emailSenderInfo.name
        )
        .sendEmail();

      return right(null);
    } catch (err) {
      const vError = new VError(err, 'Exception while handling submission on peer review cycle check');
      this.logger.error(err.message, err);
      return left(vError);
    }
  }

  private async updateInvoiceDateAccepted(invoice: Invoice, request: UpdateTransactionOnAcceptManuscriptDTO) {
    invoice.dateAccepted = request.acceptanceDate ? new Date(request.acceptanceDate) : new Date();

    await this.invoiceRepo.update(invoice);
  }

  private async activateTransaction(transaction: Transaction) {
    transaction.markAsActive();
    await this.transactionRepo.update(transaction);
  }

  private async getTransaction(invoice: Invoice) {
    try {
      // * System looks-up the transaction
      const maybeTransaction = await this.transactionRepo.getTransactionById(invoice.transactionId);

      if (maybeTransaction.isLeft()) {
        this.logger.error(maybeTransaction.value.message, maybeTransaction.value);
        throw maybeTransaction.value;
      }

      return maybeTransaction.value;
    } catch (err) {
      const transactionNotFoundError = new Errors.TransactionNotFoundError(invoice.invoiceId.id.toString());
      throw new VError(
        transactionNotFoundError,
        'Original error %s, %s',
        err.message,
        transactionNotFoundError.message
      );
    }
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

  private async getInvoiceDetails(invoiceItem: InvoiceItem, context) {
    try {
      const maybeInvoiceDetails = await this.invoiceDetailsUsecase.execute(
        { invoiceId: invoiceItem.invoiceId.id.toString() },
        context
      );
      if (maybeInvoiceDetails.isLeft()) {
        this.logger.error(maybeInvoiceDetails.value.message, maybeInvoiceDetails.value);
        throw maybeInvoiceDetails.value;
      }

      return maybeInvoiceDetails.value;
    } catch (err) {
      const invoiceNotFoundError = new Errors.InvoiceNotFoundError(invoiceItem.invoiceId.id.toString());
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
    request: UpdateTransactionOnAcceptManuscriptDTO,
    manuscript: Manuscript
  ) {
    try {
      await this.waiverRepo.removeInvoiceItemWaivers(invoiceItem.invoiceItemId);
      await this.waiverService.applyWaiver({
        invoiceId: invoice.invoiceId.id.toString(),
        allAuthorsEmails: request.authorsEmails,
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
