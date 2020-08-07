/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { getEuMembers } from 'is-eu-member';

import { UseCase } from '../../../../core/domain/UseCase';
import { right, left } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { ErpServiceContract } from '../../../../domain/services/ErpService';
import { ExchangeRateService } from '../../../../domain/services/ExchangeRateService';
import { VATService } from '../../../../domain/services/VATService';
import { PublishCreditNoteToErpResponse } from './publishCreditNoteToErpResponse';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';
import { InvoiceId } from '../../domain/InvoiceId';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { CatalogRepoContract } from '../../../journals/repos';
import { JournalId } from '../../../journals/domain/JournalId';
import { Invoice } from '../../domain/Invoice';
import { PublisherRepoContract } from '../../../publishers/repos';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { PayerType } from '../../../payers/domain/Payer';
import { ArticleRepoContract } from '../../../manuscripts/repos';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';

export interface PublishCreditNoteToErpRequestDTO {
  creditNoteId?: string;
}

export class PublishCreditNoteToErpUsecase
  implements
    UseCase<
      PublishCreditNoteToErpRequestDTO,
      Promise<PublishCreditNoteToErpResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      PublishCreditNoteToErpRequestDTO,
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
    private sageService: ErpServiceContract,
    private netSuiteService: ErpServiceContract,
    private publisherRepo: PublisherRepoContract,
    private loggerService: any
  ) {}

  private async getAccessControlContext(request: any, context?: any) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request: PublishCreditNoteToErpRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<PublishCreditNoteToErpResponse> {
    this.loggerService.info('PublishCreditNoteToERP Request', request);
    if (process.env.ERP_DISABLED === 'true') {
      return right(null);
    }

    let creditNote: Invoice;

    try {
      creditNote = await this.invoiceRepo.getInvoiceById(
        InvoiceId.create(new UniqueEntityID(request.creditNoteId)).getValue()
      );
      // this.loggerService.info('PublishCreditNoteToERP invoice', invoice);

      let invoiceItems = creditNote.invoiceItems.currentItems;
      // this.loggerService.info('PublishCreditNoteToERP invoiceItems', invoiceItems);

      if (invoiceItems.length === 0) {
        const getItemsUsecase = new GetItemsForInvoiceUsecase(
          this.invoiceItemRepo,
          this.couponRepo,
          this.waiverRepo
        );

        const resp = await getItemsUsecase.execute({
          invoiceId: request.creditNoteId,
        });
        // this.loggerService.info(
        //   'PublishCreditNoteToERP getItemsUsecase response',
        //   resp
        // );
        if (resp.isLeft()) {
          throw new Error(
            `CreditNote ${creditNote.id.toString()} has no invoice items.`
          );
        }

        invoiceItems = resp.value.getValue();
        // this.loggerService.info(
        //   'PublishCreditNoteToERP invoice items',
        //   invoiceItems
        // );

        for (const item of invoiceItems) {
          const [coupons, waivers] = await Promise.all([
            this.couponRepo.getCouponsByInvoiceItemId(item.invoiceItemId),
            this.waiverRepo.getWaiversByInvoiceItemId(item.invoiceItemId),
          ]);
          coupons.forEach((c) => item.addCoupon(c));
          item.waivers = waivers;
        }
      }

      if (invoiceItems.length === 0) {
        throw new Error(`CreditNote ${creditNote.id} has no invoice items.`);
      }

      invoiceItems.forEach((ii) => creditNote.addInvoiceItem(ii));
      // this.loggerService.info(
      //   'PublishCreditNoteToERP full invoice items',
      //   invoiceItems
      // );

      // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
      if (creditNote.getInvoiceTotal() <= 0) {
        creditNote.erpReference = 'NON_INVOICEABLE';
        await this.invoiceRepo.update(creditNote);
        return right(null);
      }

      const payer = await this.payerRepo.getPayerByInvoiceId(
        creditNote.invoiceId
      );
      if (!payer) {
        throw new Error(`CreditNote ${creditNote.id} has no payers.`);
      }
      // this.loggerService.info('PublishCreditNoteToERP payer', payer);

      const address = await this.addressRepo.findById(payer.billingAddressId);
      if (!address) {
        throw new Error(
          `CreditNote ${creditNote.id} has no address associated.`
        );
      }
      // this.loggerService.info('PublishCreditNoteToERP address', address);

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );
      if (!manuscript) {
        throw new Error(
          `CreditNote ${creditNote.id} has no manuscripts associated.`
        );
      }
      // this.loggerService.info('PublishCreditNoteToERP manuscript', manuscript);

      const catalog = await this.catalogRepo.getCatalogItemByJournalId(
        JournalId.create(new UniqueEntityID(manuscript.journalId)).getValue()
      );
      if (!catalog) {
        throw new Error(
          `CreditNote ${creditNote.id} has no catalog associated.`
        );
      }
      // this.loggerService.info('PublishCreditNoteToERP catalog', catalog);

      const publisherCustomValues = await this.publisherRepo.getCustomValuesByPublisherId(
        catalog.publisherId
      );
      if (!publisherCustomValues) {
        throw new Error(
          `CreditNote ${creditNote.id} has no publisher associated.`
        );
      }
      // this.loggerService.info(
      //   'PublishCreditNoteToERP publisher data',
      //   publisherCustomValues
      // );

      const vatService = new VATService();
      const vatNote = vatService.getVATNote(
        {
          postalCode: address.postalCode,
          countryCode: address.country,
          stateCode: address.state,
        },
        payer.type !== PayerType.INSTITUTION
      );
      // this.loggerService.info('PublishCreditNoteToERP vatNote', vatNote);
      const exchangeRateService = new ExchangeRateService();
      // this.loggerService.info(
      //   'PublishCreditNoteToERP exchangeService',
      //   exchangeRateService
      // );
      let rate = 1.42; // ! Average value for the last seven years
      if (creditNote && creditNote.dateIssued) {
        const exchangeRate = await exchangeRateService.getExchangeRate(
          new Date(creditNote.dateIssued),
          'USD'
        );
        // this.loggerService.info(
        //   'PublishCreditNoteToERP exchangeRate',
        //   exchangeRate
        // );
        rate = exchangeRate.exchangeRate;
      }
      // this.loggerService.info('PublishCreditNoteToERP rate', rate);

      // * Calculate Tax Rate code
      // * id=10 O-GB = EXOutput_GB, i.e. Sales made outside of UK and EU
      let taxRateId = '10';
      const euCountries = getEuMembers();
      if (euCountries.includes(address.country)) {
        if (payer.type === PayerType.INSTITUTION) {
          // * id=15 ESSS-GB = ECOutputServices_GB in Sage, i.e. Sales made outside UK but in EU where there is a EU VAT registration number
          taxRateId = '15';
        } else {
          // * id=7 S-GB = StandardGB in Sage, i.e. Sales made in UK or in EU where there is no EU VAT registration number
          taxRateId = '7';
        }
      }

      try {
        const erpData = {
          creditNote,
          payer,
          items: invoiceItems,
          article: manuscript as any,
          billingAddress: address,
          journalName: catalog.journalTitle,
          vatNote,
          rate,
          tradeDocumentItemProduct: publisherCustomValues.tradeDocumentItem,
          customSegmentId: publisherCustomValues?.customSegmentId,
          itemId: publisherCustomValues?.itemId,
          taxRateId,
        };

        const netSuiteResponse = await this.netSuiteService.registerCreditNote(
          erpData
        );
        // console.info(netSuiteResponse);
        this.loggerService.info(
          `Updating credit note ${creditNote.id.toString()}: netSuiteReference -> ${JSON.stringify(
            netSuiteResponse
          )}`
        );
        creditNote.nsReference = JSON.stringify(netSuiteResponse); // netSuiteResponse;
        creditNote.erpReference = JSON.stringify(netSuiteResponse); // .tradeDocumentId;

        // this.loggerService.info('PublishCreditNoteToERP full credit note', creditNote);
        await this.invoiceRepo.update(creditNote);
        return right(netSuiteResponse);
      } catch (err) {
        return left(err);
      }
    } catch (err) {
      console.log(err);
      return left(new AppError.UnexpectedError(err, err.toString()));
    }
  }
}
