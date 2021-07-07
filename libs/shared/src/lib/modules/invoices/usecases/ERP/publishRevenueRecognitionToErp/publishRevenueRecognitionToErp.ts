import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Left, right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../../domain/authorization';

import { Manuscript } from '../../../../manuscripts/domain/Manuscript';
import { JournalId } from '../../../../journals/domain/JournalId';
import { Address } from '../../../../addresses/domain/Address';
import { Payer } from '../../../../payers/domain/Payer';
import { InvoiceId } from '../../../domain/InvoiceId';
import { Invoice } from '../../../domain/Invoice';

import { ErpReferenceMap } from './../../../../vendors/mapper/ErpReference';

import { AddressRepoContract } from '../../../../addresses/repos/addressRepo';
import { InvoiceItemRepoContract } from './../../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../../payers/repos/payerRepo';
import { ErpReferenceRepoContract } from '../../../../vendors/repos';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { ArticleRepoContract } from '../../../../manuscripts/repos';
import { InvoiceRepoContract } from './../../../repos/invoiceRepo';
import { CatalogRepoContract } from '../../../../journals/repos';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';

import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { LoggerContract } from '../../../../../infrastructure/logging/Logger';

import { GetItemsForInvoiceUsecase } from './../../getItemsForInvoice/getItemsForInvoice';

import { PublishRevenueRecognitionToErpResponse as Response } from './publishRevenueRecognitionToErpResponse';
import type { PublishRevenueRecognitionToErpRequestDTO as DTO } from './publishRevenueRecognitionToErpDTO';

export class PublishRevenueRecognitionToErpUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private addressRepo: AddressRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private catalogRepo: CatalogRepoContract,
    private publisherRepo: PublisherRepoContract,
    private erpReferenceRepo: ErpReferenceRepoContract,
    private erpService: ErpServiceContract,
    private loggerService: LoggerContract
  ) {
    super();
  }

  @Authorize('erp:publish')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let invoice: Invoice;
    let payer: Payer;
    let address: Address;
    let manuscript: Manuscript;

    const invoiceId: InvoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    );
    const getItemsUsecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );

    try {
      const maybeInvoice = await this.invoiceRepo.getInvoiceById(invoiceId);

      if (maybeInvoice.isLeft()) {
        return left(this.getReturnError(maybeInvoice));
      }

      invoice = maybeInvoice.value;

      const itemsResult = await getItemsUsecase.execute(
        {
          invoiceId: request.invoiceId,
        },
        context
      );

      if (itemsResult.isLeft()) {
        throw new Error(
          `Invoice ${invoice.id.toString()} has no invoice items.`
        );
      }

      const invoiceItems = itemsResult.value;
      if (invoiceItems.length === 0) {
        throw new Error(`Invoice ${invoice.id} has no invoice items.`);
      }

      invoice.addItems(invoiceItems);

      if (!invoice.isCreditNote()) {
        const maybePayer = await this.payerRepo.getPayerByInvoiceId(
          invoice.invoiceId
        );
        if (maybePayer.isLeft()) {
          throw new Error(`Invoice ${invoice.id} has no payers.`);
        }

        payer = maybePayer.value;

        const maybeAddress = await this.addressRepo.findById(
          payer.billingAddressId
        );
        if (maybeAddress.isLeft()) {
          throw new Error(`Invoice ${invoice.id} has no address associated.`);
        }

        address = maybeAddress.value;
      }

      const maybeManuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );
      if (maybeManuscript.isLeft()) {
        throw new Error(`Invoice ${invoice.id} has no manuscripts associated.`);
      }

      const manuscript = maybeManuscript.value;

      if (!manuscript.datePublished) {
        return right(null);
      }

      // * If it's a credit node and the manuscript has been published
      if (invoice.isCreditNote() && manuscript.datePublished) {
        return right(null);
      }

      const { customId } = manuscript;

      // * Get all invoices associated with this custom id
      const maybeRef = await this.invoiceRepo.getInvoicesByCustomId(customId);

      if (maybeRef.isLeft()) {
        return left(this.getReturnError(maybeRef));
      }

      const referencedInvoicesByCustomId = maybeRef.value;

      // * If the invoice has a credit note
      // * and the manuscript has been published before its creation
      const associatedCreditNote = referencedInvoicesByCustomId.find(
        (item) =>
          item.cancelledInvoiceReference === invoice.invoiceId.id.toString()
      );

      if (associatedCreditNote) {
        const creditNoteCreatedOn = new Date(associatedCreditNote.dateCreated);
        const { datePublished: manuscriptPublishedOn } = manuscript;

        if (
          !invoice.isCreditNote() &&
          creditNoteCreatedOn.getTime() > manuscriptPublishedOn.getTime()
        ) {
          return right(null);
        }
      }

      const maybeCatalog = await this.catalogRepo.getCatalogItemByJournalId(
        JournalId.create(new UniqueEntityID(manuscript.journalId))
      );

      if (maybeCatalog.isLeft()) {
        throw new Error(`Invoice ${invoice.id} has no catalog associated.`);
      }

      const catalog = maybeCatalog.value;

      const maybePublisherCustomValues = await this.publisherRepo.getCustomValuesByPublisherId(
        catalog.publisherId
      );
      if (maybePublisherCustomValues.isLeft()) {
        throw new Error(`Invoice ${invoice.id} has no publisher associated.`);
      }

      const publisherCustomValues = maybePublisherCustomValues.value;

      const invoiceItem = invoice.invoiceItems.getItems().shift();
      const { assignedCoupons, assignedWaivers, price } = invoiceItem;
      let netCharges = price;
      if (assignedCoupons?.length) {
        netCharges -= assignedCoupons.coupons.reduce(
          (acc, coupon) => acc + (coupon.reduction / 100) * price,
          0
        );
      }
      if (assignedWaivers?.length) {
        netCharges -= assignedWaivers.waivers.reduce(
          (acc, waiver) => acc + (waiver.reduction / 100) * price,
          0
        );
      }

      await this.invoiceRepo.update(invoice);

      // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
      if (netCharges <= 0) {
        const maybeNonInvoiceableErpReference = ErpReferenceMap.toDomain({
          entity_id: invoice.invoiceId.id.toString(),
          type: 'invoice',
          vendor: this.erpService.vendorName,
          attribute:
            this.erpService?.referenceMappings?.revenueRecognition ||
            'revenueRecognition',
          value: 'NON_INVOICEABLE',
        });

        if (maybeNonInvoiceableErpReference.isLeft()) {
          return left(this.getReturnError(maybeNonInvoiceableErpReference));
        }

        const nonInvoiceableErpReference =
          maybeNonInvoiceableErpReference.value;

        const maybeSaveResult = await this.erpReferenceRepo.save(
          nonInvoiceableErpReference
        );

        if (maybeSaveResult.isLeft()) {
          return left(this.getReturnError(maybeSaveResult));
        }

        return right(null);
      }

      const existingRevenueRecognition = await this.erpService.getExistingRevenueRecognition(
        invoice.persistentReferenceNumber,
        manuscript.customId
      );

      if (existingRevenueRecognition.count === 1) {
        const maybeErpReference = ErpReferenceMap.toDomain({
          entity_id: invoice.invoiceId.id.toString(),
          type: 'invoice',
          vendor: this.erpService.vendorName,
          attribute:
            this.erpService?.referenceMappings?.revenueRecognition ||
            'revenueRecognition',
          value: String(existingRevenueRecognition.id),
        });

        if (maybeErpReference.isLeft()) {
          return left(this.getReturnError(maybeErpReference));
        }

        const erpReference = maybeErpReference.value;

        const maybeSaveResult = await this.erpReferenceRepo.save(erpReference);

        if (maybeSaveResult.isLeft()) {
          return left(this.getReturnError(maybeSaveResult));
        }

        return right(null);
      }

      const erpResponse = await this.erpService.registerRevenueRecognition({
        manuscript,
        invoice,
        payer,
        publisherCustomValues,
        invoiceTotal: netCharges,
      });

      this.loggerService.debug('ERP response', erpResponse);

      if (erpResponse?.journal?.id) {
        this.loggerService.info(
          `ERP Revenue Recognized Invoice ${invoice.id.toString()}: revenueRecognitionReference -> ${JSON.stringify(
            erpResponse
          )}`
        );
        const maybeErpReference = ErpReferenceMap.toDomain({
          entity_id: invoice.invoiceId.id.toString(),
          type: 'invoice',
          vendor: this.erpService.vendorName,
          attribute:
            this.erpService?.referenceMappings?.revenueRecognition ||
            'revenueRecognition',
          value: String(erpResponse?.journal?.id),
        });

        if (maybeErpReference.isLeft()) {
          return left(this.getReturnError(maybeErpReference));
        }

        const erpReference = maybeErpReference.value;

        const maybeSaveResult = await this.erpReferenceRepo.save(erpReference);

        if (maybeSaveResult.isLeft()) {
          return left(this.getReturnError(maybeSaveResult));
        }

        this.loggerService.info(
          `ERP Revenue Recognized Invoice ${invoice.id.toString()}: Saved ERP reference -> ${JSON.stringify(
            erpResponse
          )}`
        );
      }
      return right(erpResponse);
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }

  private getReturnError(err: Left<any, any>): UnexpectedError {
    return new UnexpectedError(new Error(err.value.message));
  }
}
