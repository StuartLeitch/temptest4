/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { getEuMembers } from 'is-eu-member';

import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Result';
import { UseCase } from '../../../../../core/domain/UseCase';

// * Authorization Logic
import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../../domain/authorization';

import { AddressRepoContract } from '../../../../addresses/repos/addressRepo';
import { InvoiceItemRepoContract } from './../../../repos/invoiceItemRepo';
import { PayerRepoContract } from './../../../../payers/repos/payerRepo';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { ArticleRepoContract } from '../../../../manuscripts/repos';
import { InvoiceRepoContract } from './../../../repos/invoiceRepo';
import { CatalogRepoContract } from '../../../../journals/repos';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';

import { ExchangeRateService } from '../../../../../domain/services/ExchangeRateService';
import {
  ErpInvoiceRequest,
  ErpServiceContract,
} from '../../../../../domain/services/ErpService';
import { LoggerContract } from '../../../../../infrastructure/logging/Logger';
import { VATService } from '../../../../../domain/services/VATService';

import { InvoiceId } from '../../../domain/InvoiceId';
import { JournalId } from '../../../../journals/domain/JournalId';
import { Invoice } from '../../../domain/Invoice';
import { PayerType } from './../../../../payers/domain/Payer';

import { GetItemsForInvoiceUsecase } from '../../getItemsForInvoice/getItemsForInvoice';

import { PublishInvoiceToErpResponse } from './publishInvoiceToErpResponse';

export interface PublishInvoiceToErpRequestDTO {
  invoiceId?: string;
}

export class PublishInvoiceToErpUsecase
  implements
    UseCase<
      PublishInvoiceToErpRequestDTO,
      Promise<PublishInvoiceToErpResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      PublishInvoiceToErpRequestDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private addressRepo: AddressRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private catalogRepo: CatalogRepoContract,
    private erpService: ErpServiceContract,
    private publisherRepo: PublisherRepoContract,
    private loggerService: LoggerContract,
    private vatService: VATService
  ) {}

  private async getAccessControlContext(request: any, context?: any) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request: PublishInvoiceToErpRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<PublishInvoiceToErpResponse> {
    this.loggerService.info('PublishInvoiceToERP Request', request);

    let invoice: Invoice;

    try {
      invoice = await this.invoiceRepo.getInvoiceById(
        InvoiceId.create(new UniqueEntityID(request.invoiceId)).getValue()
      );
      this.loggerService.info('PublishInvoiceToERP invoice', invoice);

      const getItemsUsecase = new GetItemsForInvoiceUsecase(
        this.invoiceItemRepo,
        this.couponRepo,
        this.waiverRepo
      );

      const resp = await getItemsUsecase.execute({
        invoiceId: request.invoiceId,
      });
      this.loggerService.info(
        'PublishInvoiceToERP getItemsUsecase response',
        resp
      );
      if (resp.isLeft()) {
        throw new Error(
          `Invoice ${invoice.id.toString()} has no invoice items.`
        );
      }

      const invoiceItems = resp.value.getValue();

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
        invoice.erpReference = 'NON_INVOICEABLE';
        invoice.nsReference = 'NON_INVOICEABLE';
        await this.invoiceRepo.update(invoice);
        return right(null);
      }

      const payer = await this.payerRepo.getPayerByInvoiceId(invoice.invoiceId);
      if (!payer) {
        throw new Error(`Invoice ${invoice.id} has no payers.`);
      }
      this.loggerService.info('PublishInvoiceToERP payer', payer);

      const address = await this.addressRepo.findById(payer.billingAddressId);
      if (!address) {
        throw new Error(`Invoice ${invoice.id} has no address associated.`);
      }
      this.loggerService.info('PublishInvoiceToERP address', address);

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );
      if (!manuscript) {
        throw new Error(`Invoice ${invoice.id} has no manuscripts associated.`);
      }
      this.loggerService.info('PublishInvoiceToERP manuscript', manuscript);

      let catalog;
      try {
        catalog = await this.catalogRepo.getCatalogItemByJournalId(
          JournalId.create(new UniqueEntityID(manuscript.journalId)).getValue()
        );
        if (!catalog) {
          throw new Error(`Invoice ${invoice.id} has no catalog associated.`);
        }
        this.loggerService.info('PublishInvoiceToERP catalog', catalog);
      } catch (err) {
        return err;
      }

      const publisherCustomValues = await this.publisherRepo.getCustomValuesByPublisherId(
        catalog?.publisherId
      );
      if (!publisherCustomValues) {
        throw new Error(`Invoice ${invoice.id} has no publisher associated.`);
      }
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
        payer.type !== PayerType.INSTITUTION
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
      // * id=20 E-GB = EXOutput_GB, i.e. Sales made outside of UK and EU
      let taxRateId = '20';
      const euCountries = getEuMembers();
      if (euCountries.includes(address.country)) {
        if (payer.type === PayerType.INSTITUTION) {
          // * id=6 Z-GB = ECOutputServices_GB in Sage, i.e. Sales made outside UK but in EU where there is a EU VAT registration number
          taxRateId = '6';
        } else {
          // * id=7 S-GB = StandardGB in Sage, i.e. Sales made in UK or in EU where there is no EU VAT registration number
          taxRateId = '7';
        }
      }

      if (address.country === 'UK' || address.country === 'GB') {
        // * id=7 S-GB = StandardGB in Sage, i.e. Sales made in UK or in EU where there is no EU VAT registration number
        taxRateId = '7';
      }

      try {
        const erpData: ErpInvoiceRequest = {
          invoice,
          payer,
          items: invoiceItems,
          manuscript,
          billingAddress: address,
          journalName: catalog.journalTitle,
          vatNote,
          exchangeRate: finalExchangeRate,
          tradeDocumentItemProduct: publisherCustomValues.tradeDocumentItem,
          customSegmentId: publisherCustomValues?.customSegmentId,
          itemId: publisherCustomValues?.itemId,
          taxRateId,
        };

        const erpResponse = await this.erpService.registerInvoice(erpData);
        this.loggerService.info(
          `PublishInvoiceToERP ${this.erpService.constructor.name} response`,
          erpResponse
        );
        this.loggerService.info(
          `Updating invoice ${invoice.id.toString()}: ${
            this.erpService.invoiceErpRefFieldName
          } -> ${JSON.stringify(erpResponse)}`
        );

        invoice[this.erpService.invoiceErpRefFieldName] = String(
          erpResponse.tradeDocumentId
        );

        this.loggerService.info('PublishInvoiceToERP full invoice', invoice);
        await this.invoiceRepo.update(invoice);
        return right(erpResponse);
      } catch (err) {
        return left(err);
      }
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
