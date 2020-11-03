/* eslint-disable @typescript-eslint/no-unused-vars */
// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Result, right, left } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { DomainEvents } from '../../../../core/domain/events/DomainEvents';

import { LoggerContract } from '../../../../infrastructure/logging';

import { EmailService } from '../../../../infrastructure/communication-channels';
import { WaiverService } from '../../../../domain/services/WaiverService';
import { VATService } from '../../../../domain/services/VATService';

import { ManuscriptId } from './../../../invoices/domain/ManuscriptId';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { CatalogItem } from '../../../journals/domain/CatalogItem';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { JournalId } from '../../../journals/domain/JournalId';
import { Invoice } from '../../../invoices/domain/Invoice';
import { PayerType } from '../../../payers/domain/Payer';
import { Transaction } from '../../domain/Transaction';

import { InvoiceItemRepoContract } from './../../../invoices/repos/invoiceItemRepo';
import { AddressRepoContract } from './../../../addresses/repos/addressRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { TransactionRepoContract } from '../../repos/transactionRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { CatalogRepoContract } from '../../../journals/repos';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import { AddressMap } from '../../../addresses/mappers/AddressMap';
import { PayerMap } from '../../../payers/mapper/Payer';

import { GetItemsForInvoiceUsecase } from '../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import {
  ConfirmInvoiceUsecase,
  ConfirmInvoiceDTO,
} from '../../../invoices/usecases/confirmInvoice';

// * Usecase specifics
import { UpdateTransactionOnAcceptManuscriptResponse } from './updateTransactionOnAcceptManuscriptResponse';
import { UpdateTransactionOnAcceptManuscriptErrors } from './updateTransactionOnAcceptManuscriptErrors';
import type { UpdateTransactionOnAcceptManuscriptDTO } from './updateTransactionOnAcceptManuscriptDTOs';

export class UpdateTransactionOnAcceptManuscriptUsecase
  implements
    UseCase<
      UpdateTransactionOnAcceptManuscriptDTO,
      Promise<UpdateTransactionOnAcceptManuscriptResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      UpdateTransactionOnAcceptManuscriptDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
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
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:update')
  public async execute(
    request: UpdateTransactionOnAcceptManuscriptDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<UpdateTransactionOnAcceptManuscriptResponse> {
    let transaction: Transaction;
    let invoice: Invoice;
    let invoiceItem: InvoiceItem;
    let manuscript: Manuscript;
    let catalogItem: CatalogItem;

    // * get a proper ManuscriptId
    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(request.manuscriptId)
    ).getValue();

    const {
      sanctionedCountryNotificationReceiver,
      sanctionedCountryNotificationSender,
    } = request;

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
        [invoiceItem] = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(
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

      invoice.addInvoiceItem(invoiceItem);

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

      try {
        // * System looks-up the catalog item for the manuscript
        catalogItem = await this.catalogRepo.getCatalogItemByJournalId(
          JournalId.create(new UniqueEntityID(manuscript.journalId)).getValue()
        );
      } catch (err) {
        return left(
          new UpdateTransactionOnAcceptManuscriptErrors.CatalogItemNotFoundError(
            manuscript.journalId
          )
        );
      }

      // * Mark transaction as ACTIVE
      transaction.markAsActive();

      // * get author details
      manuscript.authorFirstName = request?.authorFirstName;
      manuscript.authorCountry = request?.authorCountry;
      manuscript.authorSurname = request?.authorSurname;
      manuscript.articleType = request?.articleType;
      manuscript.authorEmail = request?.authorEmail;
      manuscript.customId = request?.customId;
      manuscript.title = request?.title;

      // * Identify applicable waiver
      try {
        await this.waiverRepo.removeInvoiceItemWaivers(
          invoiceItem.invoiceItemId
        );
        await this.waiverService.applyWaiver({
          invoiceId: invoice.invoiceId.id.toString(),
          authorEmail: manuscript.authorEmail,
          country: manuscript.authorCountry,
          journalId: manuscript.journalId,
        });
      } catch (error) {
        console.log('Failed to save waiver', error);
        return left(
          new UnexpectedError(
            `Failed to save waiver due to error: ${error.message}: ${error.stack}`
          )
        );
      }

      await this.transactionRepo.update(transaction);
      await this.articleRepo.update(manuscript);

      invoice = await this.invoiceRepo.assignInvoiceNumber(invoice.invoiceId);
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
        return itemsWithReductions.map(() => Result.ok<void>());
      }

      invoice.addItems(itemsWithReductions.value.getValue());
      const total = invoice.invoiceTotal;

      // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
      if (total <= 0) {
        // * but we can auto-confirm it
        const confirmInvoiceUsecase = new ConfirmInvoiceUsecase(
          this.invoiceItemRepo,
          this.addressRepo,
          this.invoiceRepo,
          this.payerRepo,
          this.couponRepo,
          this.waiverRepo,
          this.emailService,
          this.vatService,
          this.loggerService
        );

        // * create new address
        const newAddress = AddressMap.toDomain({
          country: manuscript.authorCountry,
        });

        // * create new payer
        const newPayer = PayerMap.toDomain({
          // associate payer to the invoice
          invoiceId: invoice.invoiceId.id.toString(),
          name: `${manuscript.authorFirstName} ${manuscript.authorSurname}`,
          addressId: newAddress.addressId.id.toString(),
          email: manuscript.authorEmail,
          type: PayerType.INDIVIDUAL,
          organization: ' ',
        });

        const confirmInvoiceArgs: ConfirmInvoiceDTO = {
          payer: {
            ...PayerMap.toPersistence(newPayer),
            address: AddressMap.toPersistence(newAddress),
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
            return maybeConfirmed.map(() => Result.ok<void>());
          }
        } catch (err) {
          return left(new UnexpectedError(err));
        }

        return right(Result.ok<void>());
      }

      this.emailService
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

      return right(Result.ok<void>());
    } catch (err) {
      console.error(err);
      return left(new UnexpectedError(err));
    }
  }
}
