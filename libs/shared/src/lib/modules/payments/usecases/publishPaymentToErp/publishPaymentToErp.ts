/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

// import { getEuMembers } from 'is-eu-member';

import { UseCase } from '../../../../core/domain/UseCase';
import { right, left } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { ErpServiceContract } from '../../../../domain/services/ErpService';
import { ExchangeRateService } from '../../../../domain/services/ExchangeRateService';
import { VATService } from '../../../../domain/services/VATService';
import { PublishPaymentToErpResponse } from './publishPaymentToErpResponse';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';
import { PaymentId } from '../../domain/PaymentId';
import { Invoice } from '../../../invoices/domain/Invoice';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { Payment } from '../../domain/Payment';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { CatalogRepoContract } from '../../../journals/repos';
import { JournalId } from '../../../journals/domain/JournalId';
import { PublisherRepoContract } from '../../../publishers/repos';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { InvoiceItemRepoContract } from './../../../invoices/repos/invoiceItemRepo';
import { PaymentRepoContract } from './../../repos/paymentRepo';
import { PaymentMethodRepoContract } from './../../repos/paymentMethodRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { PayerType } from '../../../payers/domain/Payer';
import { ArticleRepoContract } from '../../../manuscripts/repos';
import { GetItemsForInvoiceUsecase } from './../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';

export interface PublishPaymentToErpRequestDTO {
  invoiceId?: string;
  total?: Number;
}

export class PublishPaymentToErpUsecase
  implements
    UseCase<
      PublishPaymentToErpRequestDTO,
      Promise<PublishPaymentToErpResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      PublishPaymentToErpRequestDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private paymentRepo: PaymentRepoContract,
    private paymentMethodRepo: PaymentMethodRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    // private addressRepo: AddressRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private catalogRepo: CatalogRepoContract,
    // private sageService: ErpServiceContract,
    private netSuiteService: ErpServiceContract,
    private publisherRepo: PublisherRepoContract,
    private loggerService: LoggerContract
  ) {}

  private async getAccessControlContext(request: any, context?: any) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request: PublishPaymentToErpRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<PublishPaymentToErpResponse> {
    // this.loggerService.info('PublishPaymentToERP Request', request);

    // let payment: Payment;
    let invoice: Invoice;

    try {
      invoice = await this.invoiceRepo.getInvoiceById(
        InvoiceId.create(new UniqueEntityID(request.invoiceId)).getValue()
      );
      this.loggerService.info('PublishPaymentToERP invoice', invoice);

      const paymentMethods = await this.paymentMethodRepo.getPaymentMethods();
      const payments = await this.paymentRepo.getPaymentsByInvoiceId(
        invoice.invoiceId
      );

      let invoiceItems = invoice.invoiceItems.currentItems;
      // // this.loggerService.info('PublishInvoiceToERP invoiceItems', invoiceItems);

      if (invoiceItems.length === 0) {
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

        invoiceItems = resp.value.getValue();
        this.loggerService.info(
          'PublishInvoiceToERP invoice items',
          invoiceItems
        );

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
        throw new Error(`Invoice ${invoice.id} has no invoice items.`);
      }

      invoiceItems.forEach((ii) => invoice.addInvoiceItem(ii));
      this.loggerService.info(
        'PublishInvoiceToERP full invoice items',
        invoiceItems
      );

      // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
      if (invoice.getInvoiceTotal() <= 0) {
        invoice.erpReference = 'NON_INVOICEABLE';
        await this.invoiceRepo.update(invoice);
        return right(null);
      }

      const payer = await this.payerRepo.getPayerByInvoiceId(invoice.invoiceId);
      if (!payer) {
        throw new Error(`Invoice ${invoice.id} has no payers.`);
      }
      // this.loggerService.info('PublishInvoiceToERP payer', payer);

      // const address = await this.addressRepo.findById(payer.billingAddressId);
      // if (!address) {
      //   throw new Error(`Invoice ${invoice.id} has no address associated.`);
      // }
      // this.loggerService.info('PublishInvoiceToERP address', address);

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

      // const vatService = new VATService();
      // const vatNote = vatService.getVATNote(
      //   {
      //     postalCode: address.postalCode,
      //     countryCode: address.country,
      //     stateCode: address.state,
      //   },
      //   payer.type !== PayerType.INSTITUTION
      // );
      // this.loggerService.info('PublishInvoiceToERP vatNote', vatNote);
      // const exchangeRateService = new ExchangeRateService();
      // this.loggerService.info(
      //   'PublishInvoiceToERP exchangeService',
      //   exchangeRateService
      // );
      // let rate = 1.42; // ! Average value for the last seven years
      // if (invoice && invoice.dateIssued) {
      //   const exchangeRate = await exchangeRateService.getExchangeRate(
      //     new Date(invoice.dateIssued),
      //     'USD'
      //   );
      //   this.loggerService.info(
      //     'PublishInvoiceToERP exchangeRate',
      //     exchangeRate
      //   );
      //   rate = exchangeRate.exchangeRate;
      // }
      // this.loggerService.info('PublishInvoiceToERP rate', rate);

      // // * Calculate Tax Rate code
      // // * id=10 O-GB = EXOutput_GB, i.e. Sales made outside of UK and EU
      // let taxRateId = '10';
      // const euCountries = getEuMembers();
      // if (euCountries.includes(address.country)) {
      //   if (payer.type === PayerType.INSTITUTION) {
      //     // * id=15 ESSS-GB = ECOutputServices_GB in Sage, i.e. Sales made outside UK but in EU where there is a EU VAT registration number
      //     taxRateId = '15';
      //   } else {
      //     // * id=7 S-GB = StandardGB in Sage, i.e. Sales made in UK or in EU where there is no EU VAT registration number
      //     taxRateId = '7';
      //   }
      // }

      try {
        const erpData = {
          invoice,
          payer,
          paymentMethods,
          payments,
          total: request.total,
          items: invoiceItems,
          article: manuscript as any,
          // billingAddress: address,
          // journalName: catalog.journalTitle,
          // vatNote,
          // rate,
          tradeDocumentItemProduct: publisherCustomValues.tradeDocumentItem,
          customSegmentId: publisherCustomValues?.customSegmentId,
          itemId: publisherCustomValues?.itemId,
          // taxRateId,
        };

        // const netSuiteResponse = await this.netSuiteService.registerPayment(
        //   erpData
        // );
        // this.loggerService.info(
        //   'PublishPaymentToERP NetSuite response',
        //   netSuiteResponse
        // );
        // this.loggerService.info(
        //   `Updating payment ${payment.id.toString()}: netSuiteReference -> ${JSON.stringify(
        //     netSuiteResponse
        //   )}`
        // );
        // invoice.nsReference = String(netSuiteResponse); // netSuiteResponse; // .tradeDocumentId;

        const [payment] = payments;
        let erpResponse;
        try {
          erpResponse = await this.netSuiteService.registerPayment(erpData);

          if (erpResponse) {
            this.loggerService.info(
              `Updating invoice ${invoice.id.toString()}: paymentReference -> ${JSON.stringify(
                erpResponse
              )}`
            );

            payment.foreignPaymentId = erpResponse.tradeDocumentId;
          }
        } catch (error) {
          this.loggerService.info(
            `[PublishPaymentToERP]: Failed to register payment in NetSuite. Err: ${error}`
          );
        }
        this.loggerService.info(
          'PublishPaymentToERP NetSuite response',
          erpResponse
        );

        this.loggerService.info('PublishPaymentToERP full invoice', invoice);
        await this.paymentRepo.updatePayment(payment);

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
