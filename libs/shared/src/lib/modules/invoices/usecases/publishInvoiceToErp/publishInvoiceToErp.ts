/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { ErpServiceContract } from '../../../../domain/services/ErpService';
import { ExchangeRateService } from '../../../../domain/services/ExchangeRateService';
import {
  AuthorizationContext,
  Roles,
  AccessControlledUsecase,
  AccessControlContext,
  // Authorize,
  InvoiceItemRepoContract,
  PayerRepoContract,
  ArticleRepoContract,
  InvoiceRepoContract,
  VATService,
  PayerType,
  GetItemsForInvoiceUsecase,
} from '@hindawi/shared';
import { UseCase } from 'libs/shared/src/lib/core/domain/UseCase';
import { right, Result, left } from 'libs/shared/src/lib/core/logic/Result';
import { AppError } from 'libs/shared/src/lib/core/logic/AppError';
import { PublishInvoiceToErpResponse } from './publishInvoiceToErpResponse';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';
import { InvoiceId } from '../../domain/InvoiceId';
import { UniqueEntityID } from 'libs/shared/src/lib/core/domain/UniqueEntityID';
import { CatalogRepoContract } from '../../../journals/repos';
import { JournalId } from '../../../journals/domain/JournalId';
import { Invoice } from '../../domain/Invoice';
import { PublisherRepoContract } from '../../../publishers/repos';
// import { GetPublisherCustomValuesUsecase } from '../../../publishers/usecases/getPublisherCustomValues';

export interface PublishInvoiceToErpRequestDTO {
  invoiceId?: string;
}

export type PublishInvoiceToErpContext = AuthorizationContext<Roles>;

export class PublishInvoiceToErpUsecase
  implements
    UseCase<
      PublishInvoiceToErpRequestDTO,
      Promise<PublishInvoiceToErpResponse>,
      PublishInvoiceToErpContext
    >,
    AccessControlledUsecase<
      PublishInvoiceToErpRequestDTO,
      PublishInvoiceToErpContext,
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
    private loggerService: any
  ) {}

  private async getAccessControlContext(request: any, context?: any) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request: PublishInvoiceToErpRequestDTO,
    context?: PublishInvoiceToErpContext
  ): Promise<PublishInvoiceToErpResponse> {
    if (process.env.ERP_DISABLED === 'true') {
      return right(Result.ok<any>(null));
    }

    let invoice: Invoice;

    try {
      invoice = await this.invoiceRepo.getInvoiceById(
        InvoiceId.create(new UniqueEntityID(request.invoiceId)).getValue()
      );

      let invoiceItems = invoice.invoiceItems.currentItems;

      if (invoiceItems.length === 0) {
        const getItemsUsecase = new GetItemsForInvoiceUsecase(
          this.invoiceItemRepo,
          this.couponRepo,
          this.waiverRepo
        );

        const resp = await getItemsUsecase.execute({
          invoiceId: request.invoiceId,
        });
        if (resp.isLeft()) {
          throw new Error(
            `Invoice ${invoice.id.toString()} has no invoice items.`
          );
        }

        invoiceItems = resp.value.getValue();
      }

      if (invoiceItems.length === 0) {
        throw new Error(`Invoice ${invoice.id} has no invoice items.`);
      }

      // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
      if (invoice.getInvoiceTotal() <= 0) {
        return right(Result.ok<any>(null));
      }

      const payer = await this.payerRepo.getPayerByInvoiceId(invoice.invoiceId);
      if (!payer) {
        throw new Error(`Invoice ${invoice.id} has no payers.`);
      }

      const address = await this.addressRepo.findById(payer.billingAddressId);
      if (!address) {
        throw new Error(`Invoice ${invoice.id} has no address associated.`);
      }

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );
      if (!manuscript) {
        throw new Error(`Invoice ${invoice.id} has no manuscripts associated.`);
      }

      const catalog = await this.catalogRepo.getCatalogItemByJournalId(
        JournalId.create(new UniqueEntityID(manuscript.journalId)).getValue()
      );
      if (!catalog) {
        throw new Error(`Invoice ${invoice.id} has no catalog associated.`);
      }

      const publisherCustomValues = await this.publisherRepo.getCustomValuesByPublisherId(
        catalog.publisherId
      );
      if (!publisherCustomValues) {
        throw new Error(`Invoice ${invoice.id} has no publisher associated.`);
      }

      const vatService = new VATService();
      const vatNote = vatService.getVATNote(
        {
          postalCode: address.postalCode,
          countryCode: address.country,
          stateCode: address.state,
        },
        payer.type !== PayerType.INSTITUTION
      );
      const exchangeRateService = new ExchangeRateService();
      let rate = 1.42; // ! Average value for the last seven years
      if (invoice && invoice.dateIssued) {
        const exchangeRate = await exchangeRateService.getExchangeRate(
          new Date(invoice.dateIssued),
          'USD'
        );
        rate = exchangeRate.exchangeRate;
      }
      const erpResponse = await this.erpService.registerInvoice({
        invoice,
        payer,
        items: invoiceItems,
        article: manuscript as any,
        billingAddress: address,
        journalName: catalog.journalTitle,
        vatNote,
        rate,
        tradeDocumentItemProduct: publisherCustomValues.tradeDocumentItem,
      });

      this.loggerService.info(
        `Updating invoice ${invoice.id.toString()}: erpReference -> ${
          erpResponse.tradeDocumentId
        }`
      );
      invoice.erpReference = erpResponse.tradeDocumentId;
      await this.invoiceRepo.update(invoice);

      return right(Result.ok<any>(erpResponse));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
