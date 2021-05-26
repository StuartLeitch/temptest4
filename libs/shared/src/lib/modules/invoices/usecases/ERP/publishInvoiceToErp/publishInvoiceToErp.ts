import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../../domain/authorization';

import { ErpReferenceRepoContract } from './../../../../vendors/repos/ErpReferenceRepo';
import { AddressRepoContract } from '../../../../addresses/repos/addressRepo';
import { ErpReferenceMap } from './../../../../vendors/mapper/ErpReference';
import { InvoiceItemRepoContract } from './../../../repos/invoiceItemRepo';
import { PayerRepoContract } from './../../../../payers/repos/payerRepo';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { ArticleRepoContract } from '../../../../manuscripts/repos';
import { InvoiceRepoContract } from './../../../repos/invoiceRepo';
import { CatalogRepoContract } from '../../../../journals/repos';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';

import { ExchangeRateService } from '../../../../../domain/services/ExchangeRateService';
import { LoggerContract } from '../../../../../infrastructure/logging/Logger';
import { VATService } from '../../../../../domain/services/VATService';
import {
  ErpServiceContract,
  ErpInvoiceRequest,
} from '../../../../../domain/services/ErpService';

import { CatalogItem } from '../../../../journals/domain/CatalogItem';
import { JournalId } from '../../../../journals/domain/JournalId';
import { PayerType } from './../../../../payers/domain/Payer';
import { InvoiceId } from '../../../domain/InvoiceId';
import { Invoice } from '../../../domain/Invoice';

import { GetItemsForInvoiceUsecase } from '../../getItemsForInvoice/getItemsForInvoice';
import { PublishInvoiceToErpResponse as Response } from './publishInvoiceToErpResponse';
import type { PublishInvoiceToErpRequestDTO as DTO } from './publishInvoiceToErpDTO';

export class PublishInvoiceToErpUsecase
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
    private erpReferenceRepo: ErpReferenceRepoContract,
    private erpService: ErpServiceContract,
    private publisherRepo: PublisherRepoContract,
    private loggerService: LoggerContract,
    private vatService: VATService
  ) {
    super();
  }

  @Authorize('erp:publish')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    this.loggerService.setScope('PublishInvoiceToERP');
    this.loggerService.info('PublishInvoiceToERP Request', request);

    let invoice: Invoice;

    try {
      const maybeInvoice = await this.invoiceRepo.getInvoiceById(
        InvoiceId.create(new UniqueEntityID(request.invoiceId))
      );

      if (maybeInvoice.isLeft()) {
        return left(new UnexpectedError(new Error(maybeInvoice.value.message)));
      }
      invoice = maybeInvoice.value;

      this.loggerService.info('PublishInvoiceToERP invoice', invoice);

      const getItemsUsecase = new GetItemsForInvoiceUsecase(
        this.invoiceItemRepo,
        this.couponRepo,
        this.waiverRepo
      );

      const resp = await getItemsUsecase.execute(
        {
          invoiceId: request.invoiceId,
        },
        context
      );
      this.loggerService.info(
        'PublishInvoiceToERP getItemsUsecase response',
        resp
      );
      if (resp.isLeft()) {
        throw new Error(
          `Invoice ${invoice.id.toString()} has no invoice items.`
        );
      }

      const invoiceItems = resp.value;

      this.loggerService.info('PublishInvoiceToERP invoiceItems', invoiceItems);

      if (invoiceItems.length === 0) {
        throw new Error(`Invoice ${invoice.id} has no invoice items.`);
      }

      invoice.addItems(invoiceItems);
      this.loggerService.info(
        'PublishInvoiceToERP full invoice items',
        invoiceItems
      );

      // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
      if (invoice.getInvoiceTotal() <= 0) {
        const nonInvoiceableErpReference = ErpReferenceMap.toDomain({
          entity_id: invoice.invoiceId.id.toString(),
          type: 'invoice',
          vendor: this.erpService.vendorName,
          attribute:
            this.erpService?.referenceMappings?.invoiceConfirmation ||
            'invoice',
          value: 'NON_INVOICEABLE',
        });

        if (nonInvoiceableErpReference.isLeft()) {
          return left(
            new UnexpectedError(
              new Error(nonInvoiceableErpReference.value.message)
            )
          );
        }

        await this.erpReferenceRepo.save(nonInvoiceableErpReference.value);

        this.loggerService.info(
          `PublishInvoiceToERP Flag invoice ${invoice.invoiceId.id.toString()} as NON_INVOICEABLE`,
          nonInvoiceableErpReference
        );

        return right(null);
      }

      const maybePayer = await this.payerRepo.getPayerByInvoiceId(
        invoice.invoiceId
      );
      if (maybePayer.isLeft()) {
        throw new Error(`Invoice ${invoice.id} has no payers.`);
      }
      const payer = maybePayer.value;
      this.loggerService.info('PublishInvoiceToERP payer', payer);

      const maybeAddress = await this.addressRepo.findById(
        payer.billingAddressId
      );
      if (maybeAddress.isLeft()) {
        throw new Error(`Invoice ${invoice.id} has no address associated.`);
      }
      const address = maybeAddress.value;
      this.loggerService.info('PublishInvoiceToERP address', address);

      const maybeManuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );
      if (maybeManuscript.isLeft()) {
        throw new Error(`Invoice ${invoice.id} has no manuscripts associated.`);
      }
      const manuscript = maybeManuscript.value;
      this.loggerService.info('PublishInvoiceToERP manuscript', manuscript);

      let catalog: CatalogItem;
      try {
        const maybeCatalog = await this.catalogRepo.getCatalogItemByJournalId(
          JournalId.create(new UniqueEntityID(manuscript.journalId))
        );

        if (maybeCatalog.isLeft()) {
          throw new Error(maybeCatalog.value.message);
        }

        catalog = maybeCatalog.value;

        if (!catalog) {
          throw new Error(`Invoice ${invoice.id} has no catalog associated.`);
        }
        this.loggerService.info('PublishInvoiceToERP catalog', catalog);
      } catch (err) {
        return err;
      }

      const maybePublisherCustomValues = await this.publisherRepo.getCustomValuesByPublisherId(
        catalog?.publisherId
      );
      if (maybePublisherCustomValues.isLeft()) {
        throw new Error(`Invoice ${invoice.id} has no publisher associated.`);
      }
      const publisherCustomValues = maybePublisherCustomValues.value;
      this.loggerService.info(
        'PublishInvoiceToERP publisher data',
        publisherCustomValues
      );

      const vatNote = this.vatService.getVATNote(
        {
          postalCode: address.postalCode,
          countryCode: address.country,
          stateCode: address.state,
        },
        payer.type !== PayerType.INSTITUTION,
        invoice.dateIssued
      );
      this.loggerService.info('PublishInvoiceToERP vatNote', vatNote);
      const exchangeRateService = new ExchangeRateService();
      this.loggerService.info(
        'PublishInvoiceToERP exchangeService',
        exchangeRateService
      );
      let finalExchangeRate = 1.42; // ! Average value for the last seven years
      if (invoice && invoice.dateIssued) {
        let exchangeRate = null;
        try {
          exchangeRate = await exchangeRateService.getExchangeRate(
            new Date(invoice.dateIssued),
            'USD'
          );
          this.loggerService.info(
            'PublishInvoiceToERP exchangeRate',
            exchangeRate
          );
        } catch (error) {
          this.loggerService.error('PublishInvoiceToERP exchangeRate', error);
        }
        if (exchangeRate?.exchangeRate) {
          finalExchangeRate = exchangeRate.exchangeRate;
        }
      }
      this.loggerService.info('PublishInvoiceToERP rate', finalExchangeRate);

      // * Calculate Tax Rate code
      // * id=55 GB_ZR = EXOutput_GB, i.e. Sales made outside of UK and EU
      let taxRateId = 'GB_ZR';

      if (address.country === 'UK' || address.country === 'GB') {
        // * id=53 GB_SR = StandardGB in Sage, i.e. Sales made in UK where there is no EU VAT registration number
        taxRateId = 'GB_SR';
      }

      try {
        await this.invoiceRepo.update(invoice);
        this.loggerService.info('PublishInvoiceToERP full invoice', invoice);

        const erpData: ErpInvoiceRequest = {
          invoice,
          payer,
          items: invoiceItems,
          manuscript,
          billingAddress: address,
          journalName: catalog.journalTitle,
          vatNote,
          exchangeRate: finalExchangeRate,
          customSegmentId: publisherCustomValues.customSegmentId,
          itemId: publisherCustomValues.itemId,
          taxRateId,
        };

        const erpResponse = await this.erpService.registerInvoice(erpData);
        this.loggerService.info(
          `PublishInvoiceToERP ${this.erpService.constructor.name} response`,
          erpResponse
        );

        if (erpResponse) {
          // * Save ERP reference
          const erpPaymentReference = ErpReferenceMap.toDomain({
            entity_id: invoice.invoiceId.id.toString(),
            type: 'invoice',
            vendor: this.erpService.vendorName,
            attribute:
              this.erpService?.referenceMappings?.invoiceConfirmation ||
              'invoice',
            value: String(erpResponse.tradeDocumentId),
          });

          if (erpPaymentReference.isLeft()) {
            return left(
              new UnexpectedError(new Error(erpPaymentReference.value.message))
            );
          }

          await this.erpReferenceRepo.save(erpPaymentReference.value);
          this.loggerService.info(`Added ErpReference`, erpPaymentReference);
        }

        return right(erpResponse);
      } catch (err) {
        return left(new UnexpectedError(err, err.toString()));
      }
    } catch (err) {
      this.loggerService.error(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
