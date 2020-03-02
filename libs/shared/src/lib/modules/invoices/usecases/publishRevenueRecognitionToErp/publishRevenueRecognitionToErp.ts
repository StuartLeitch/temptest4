import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { right, Result, left } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { ErpServiceContract } from '../../../../domain/services/ErpService';
import { ExchangeRateService } from '../../../../domain/services/ExchangeRateService';

import {
  AuthorizationContext,
  Roles,
  AccessControlledUsecase,
  AccessControlContext,
  // Authorize,
  // PayerRepoContract,
  // ArticleRepoContract,
  InvoiceRepoContract,
  // VATService,
  // PayerType,
  GetItemsForInvoiceUsecase
} from '@hindawi/shared';
// import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';
import { Invoice } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
import { Payer } from '../../../payers/domain/Payer';
import { Address } from '../../../addresses/domain/Address';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceItemRepoContract } from './../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos';
import { CatalogRepoContract } from '../../../journals/repos';
import { PublisherRepoContract } from '../../../publishers/repos';
import { JournalId } from '../../../journals/domain/JournalId';
import { PublishRevenueRecognitionToErpResponse } from './publishRevenueRecognitionToErpResponse';

export interface PublishRevenueRecognitionToErpRequestDTO {
  invoiceId?: string;
}

export type PublishRevenueRecognitionToErpContext = AuthorizationContext<Roles>;

export class PublishRevenueRecognitionToErpUsecase
  implements
    UseCase<
      PublishRevenueRecognitionToErpRequestDTO,
      Promise<PublishRevenueRecognitionToErpResponse>,
      PublishRevenueRecognitionToErpContext
    >,
    AccessControlledUsecase<
      PublishRevenueRecognitionToErpRequestDTO,
      PublishRevenueRecognitionToErpContext,
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
    private publisherRepo: PublisherRepoContract,
    private erpService: ErpServiceContract,
    private loggerService: any
  ) {}

  private async getAccessControlContext(request: any, context?: any) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request: PublishRevenueRecognitionToErpRequestDTO,
    context?: PublishRevenueRecognitionToErpContext
  ): Promise<PublishRevenueRecognitionToErpResponse> {
    // TODO Looks very hackish, to be changed later
    if (process.env.ERP_DISABLED === 'true') {
      return right(Result.ok<any>(null));
    }

    let invoice: Invoice;
    let payer: Payer;
    let address: Address;
    let manuscript: Manuscript;

    const invoiceId: InvoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();
    const getItemsUsecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );

    try {
      invoice = await this.invoiceRepo.getInvoiceById(invoiceId);

      const itemsResult = await getItemsUsecase.execute({
        invoiceId: request.invoiceId
      });

      if (itemsResult.isLeft()) {
        throw new Error(
          `Invoice ${invoice.id.toString()} has no invoice items.`
        );
      }

      const invoiceItems = itemsResult.value.getValue();
      if (invoiceItems.length === 0) {
        throw new Error(`Invoice ${invoice.id} has no invoice items.`);
      }

      invoiceItems.forEach(ii => invoice.addInvoiceItem(ii));

      payer = await this.payerRepo.getPayerByInvoiceId(invoice.invoiceId);
      if (!payer) {
        throw new Error(`Invoice ${invoice.id} has no payers.`);
      }

      address = await this.addressRepo.findById(payer.billingAddressId);
      if (!address) {
        throw new Error(`Invoice ${invoice.id} has no address associated.`);
      }

      manuscript = await this.manuscriptRepo.findById(
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

      const invoiceItem = invoice.invoiceItems.getItems().shift();
      const { coupons, waivers, price, vat } = invoiceItem;
      let netCharges = price;
      if (coupons?.length) {
        netCharges -= coupons.reduce(
          (acc, coupon) => acc + (coupon.reduction / 100) * price,
          0
        );
      }
      if (waivers?.length) {
        netCharges -= waivers.reduce(
          (acc, waiver) => acc + (waiver.reduction / 100) * price,
          0
        );
      }
      // const vatValue = (netCharges / 100) * vat;
      // const total = netCharges; // + vatValue;

      const erpResponse = await this.erpService.registerRevenueRecognition({
        invoice,
        manuscript,
        invoiceTotal: netCharges,
        publisherCustomValues
      });

      this.loggerService.info(
        `Revenue Recognized Invoice ${invoice.id.toString()}: revenueRecognitionReference -> ${
          erpResponse.journal.id
        }`
      );
      invoice.revenueRecognitionReference = erpResponse.journal.id;

      await this.invoiceRepo.update(invoice);

      return right(Result.ok<any>(erpResponse));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
