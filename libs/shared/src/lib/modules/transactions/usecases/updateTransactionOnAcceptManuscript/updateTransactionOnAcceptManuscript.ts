// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { EmailService } from '../../../../infrastructure/communication-channels';
import { WaiverService } from '../../../../domain/services/WaiverService';
import { LoggerContract } from '../../../../infrastructure/logging';
import { VATService } from '../../../../domain/services/VATService';

import { ManuscriptId } from './../../../manuscripts/domain/ManuscriptId';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { CatalogItem } from '../../../journals/domain/CatalogItem';
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
import {
  ConfirmInvoiceUsecase,
  ConfirmInvoiceDTO,
} from '../../../invoices/usecases/confirmInvoice';

// * Usecase specifics
import { UpdateTransactionOnAcceptManuscriptResponse as Response } from './updateTransactionOnAcceptManuscriptResponse';
import type { UpdateTransactionOnAcceptManuscriptDTO as DTO } from './updateTransactionOnAcceptManuscriptDTO';
import * as Errors from './updateTransactionOnAcceptManuscriptErrors';

export class UpdateTransactionOnAcceptManuscriptUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
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
    private waiverService: WaiverService,
    private emailService: EmailService,
    private vatService: VATService,
    private loggerService: LoggerContract
  ) {
    super();
  }

  @Authorize('transaction:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let transaction: Transaction;
    let invoice: Invoice;
    let invoiceItem: InvoiceItem;
    let manuscript: Manuscript;
    let catalogItem: CatalogItem;

    // * get a proper ManuscriptId
    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    );

    const {
      sanctionedCountryNotificationReceiver,
      sanctionedCountryNotificationSender,
    } = request;

    try {
      try {
        // * System identifies manuscript by Id
        const maybeManuscript = await this.articleRepo.findById(manuscriptId);

        if (maybeManuscript.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeManuscript.value.message))
          );
        }

        manuscript = maybeManuscript.value;
      } catch (err) {
        return left(new Errors.ManuscriptNotFoundError(request.manuscriptId));
      }

      try {
        // * System identifies invoice item by manuscript Id
        const maybeInvoiceItem =
          await this.invoiceItemRepo.getInvoiceItemByManuscriptId(manuscriptId);

        if (maybeInvoiceItem.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeInvoiceItem.value.message))
          );
        }

        invoiceItem = maybeInvoiceItem.value[0];
      } catch (err) {
        return left(new Errors.InvoiceItemNotFoundError(request.manuscriptId));
      }

      try {
        // * System identifies invoice by invoice item Id
        const maybeInvoice = await this.invoiceRepo.getInvoiceById(
          invoiceItem.invoiceId
        );

        if (maybeInvoice.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeInvoice.value.message))
          );
        }

        invoice = maybeInvoice.value;
      } catch (err) {
        return left(
          new Errors.InvoiceNotFoundError(invoiceItem.invoiceId.id.toString())
        );
      }

      invoice.addInvoiceItem(invoiceItem);

      try {
        // * System looks-up the transaction
        const maybeTransaction = await this.transactionRepo.getTransactionById(
          invoice.transactionId
        );

        if (maybeTransaction.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeTransaction.value.message))
          );
        }

        transaction = maybeTransaction.value;
      } catch (err) {
        return left(
          new Errors.TransactionNotFoundError(invoice.invoiceId.id.toString())
        );
      }

      try {
        // * System looks-up the catalog item for the manuscript
        const maybeCatalogItem =
          await this.catalogRepo.getCatalogItemByJournalId(
            JournalId.create(new UniqueEntityID(manuscript.journalId))
          );

        if (maybeCatalogItem.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeCatalogItem.value.message))
          );
        }

        catalogItem = maybeCatalogItem.value;
      } catch (err) {
        return left(new Errors.CatalogItemNotFoundError(manuscript.journalId));
      }

      // * Mark transaction as ACTIVE
      transaction.markAsActive();

      // * get author details
      manuscript.authorFirstName = request?.correspondingAuthorFirstName;
      manuscript.authorCountry = request?.correspondingAuthorCountry;
      manuscript.authorSurname = request?.correspondingAuthorSurname;
      manuscript.articleType = request?.articleType;
      manuscript.authorEmail = request?.correspondingAuthorEmail;
      manuscript.customId = request?.customId;
      manuscript.title = request?.title;

      // * Identify applicable waiver
      try {
        await this.waiverRepo.removeInvoiceItemWaivers(
          invoiceItem.invoiceItemId
        );
        await this.waiverService.applyWaiver({
          invoiceId: invoice.invoiceId.id.toString(),
          allAuthorsEmails: request.authorsEmails,
          country: manuscript.authorCountry,
          journalId: manuscript.journalId,
        });
      } catch (error) {
        return left(
          new UnexpectedError(
            new Error(
              `Failed to save waiver due to error: ${error.message}: ${error.stack}`
            )
          )
        );
      }

      await this.transactionRepo.update(transaction);
      await this.articleRepo.update(manuscript);

      invoice.dateAccepted = request.acceptanceDate
        ? new Date(request.acceptanceDate)
        : new Date();

      await this.invoiceRepo.update(invoice);

      invoice.generateCreatedEvent();
      DomainEvents.dispatchEventsForAggregate(invoice.id);

      const invoiceItemsUsecase = new GetItemsForInvoiceUsecase(
        this.invoiceItemRepo,
        this.couponRepo,
        this.waiverRepo
      );
      const itemsWithReductions = await invoiceItemsUsecase.execute(
        { invoiceId: invoice.id.toString() },
        context
      );

      if (itemsWithReductions.isLeft()) {
        return itemsWithReductions.map(() => null);
      }

      invoice.addItems(itemsWithReductions.value);
      const total = invoice.invoiceTotal;

      // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
      if (total <= 0) {
        // * but we can auto-confirm it
        const confirmInvoiceUsecase = new ConfirmInvoiceUsecase(
          this.invoiceItemRepo,
          this.transactionRepo,
          this.addressRepo,
          this.invoiceRepo,
          this.couponRepo,
          this.waiverRepo,
          this.payerRepo,
          this.loggerService,
          this.vatService
        );

        // * create new address
        const maybeNewAddress = AddressMap.toDomain({
          country: manuscript.authorCountry,
        });

        if (maybeNewAddress.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeNewAddress.value.message))
          );
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
          return left(
            new UnexpectedError(new Error(maybeNewPayer.value.message))
          );
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
          const maybeConfirmed = await confirmInvoiceUsecase.execute(
            confirmInvoiceArgs,
            context
          );
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
      console.error(err);
      return left(new UnexpectedError(err));
    }
  }
}
