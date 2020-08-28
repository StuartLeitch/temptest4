/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, Result, left } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { ErpServiceContract } from '../../../../domain/services/ErpService';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';
import { Invoice } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
import { Payer } from '../../../payers/domain/Payer';
import { Address } from '../../../addresses/domain/Address';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceItemRepoContract } from './../../repos/invoiceItemRepo';
import { InvoiceRepoContract } from './../../repos/invoiceRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos';
import { CatalogRepoContract } from '../../../journals/repos';
import { PublisherRepoContract } from '../../../publishers/repos';
import { JournalId } from '../../../journals/domain/JournalId';
import { GetItemsForInvoiceUsecase } from './../getItemsForInvoice/getItemsForInvoice';
import { PublishRevenueRecognitionToErpResponse } from './publishRevenueRecognitionToErpResponse';

export interface PublishRevenueRecognitionToErpRequestDTO {
  invoiceId?: string;
}

export class PublishRevenueRecognitionToErpUsecase
  implements
    UseCase<
      PublishRevenueRecognitionToErpRequestDTO,
      Promise<PublishRevenueRecognitionToErpResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      PublishRevenueRecognitionToErpRequestDTO,
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
    private publisherRepo: PublisherRepoContract,
    private sageService: ErpServiceContract,
    private netSuiteService: ErpServiceContract,
    private loggerService: any
  ) {}

  private async getAccessControlContext(request: any, context?: any) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request: PublishRevenueRecognitionToErpRequestDTO,
    context?: UsecaseAuthorizationContext
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
        invoiceId: request.invoiceId,
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

      invoiceItems.forEach((ii) => invoice.addInvoiceItem(ii));

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
      const { coupons, waivers, price } = invoiceItem;
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

      // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
      if (netCharges <= 0) {
        invoice.erpReference = 'NON_INVOICEABLE';
        await this.invoiceRepo.update(invoice);
        return right(Result.ok<any>(null));
      }

      const netSuiteResponse = await this.netSuiteService.registerRevenueRecognition(
        {
          invoice,
          article: manuscript as any,
          payer,
          customSegmentId: publisherCustomValues?.customSegmentId,
          invoiceTotal: netCharges,
        }
      );

      this.loggerService.info(
        `NetSuite Revenue Recognized Invoice ${invoice.id.toString()}: revenueRecognitionReference -> ${JSON.stringify(
          netSuiteResponse
        )}`
      );
      invoice.nsRevRecReference = String(netSuiteResponse);

      try {
        const erpResponse = await this.sageService.registerRevenueRecognition({
          invoice,
          manuscript,
          customSegmentId: publisherCustomValues?.customSegmentId,
          invoiceTotal: netCharges,
          publisherCustomValues,
        });
        this.loggerService.info(
          `Revenue Recognized Invoice ${invoice.id.toString()}: revenueRecognitionReference -> ${
            erpResponse.journal.id
          }`
        );
        invoice.revenueRecognitionReference = erpResponse.journal.id;
      } catch (error) {
        this.loggerService.info(
          `Revenue Recognition in SAGE failed for Invoice ${invoice.id.toString()}: error -> ${
            error.message
          }`
        );
      }

      await this.invoiceRepo.update(invoice);

      return right(Result.ok<any>(netSuiteResponse));
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
