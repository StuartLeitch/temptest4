/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { Result, right, left } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { UseCase } from '../../../../../core/domain/UseCase';

// * Authorization Logic
import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../../domain/authorization';

import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { AddressRepoContract } from '../../../../addresses/repos/addressRepo';
import { InvoiceItemRepoContract } from './../../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../../payers/repos/payerRepo';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { ArticleRepoContract } from '../../../../manuscripts/repos';
import { InvoiceRepoContract } from './../../../repos/invoiceRepo';
import { CatalogRepoContract } from '../../../../journals/repos';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';

import { Manuscript } from '../../../../manuscripts/domain/Manuscript';
import { JournalId } from '../../../../journals/domain/JournalId';
import { Address } from '../../../../addresses/domain/Address';
import { Payer } from '../../../../payers/domain/Payer';
import { InvoiceId } from '../../../domain/InvoiceId';
import { Invoice } from '../../../domain/Invoice';

import { LoggerContract } from '../../../../../infrastructure/logging/Logger';

import { GetItemsForInvoiceUsecase } from './../../getItemsForInvoice/getItemsForInvoice';

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
    private erpService: ErpServiceContract,
    private loggerService: LoggerContract
  ) {}

  private async getAccessControlContext(request: any, context?: any) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request: PublishRevenueRecognitionToErpRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<PublishRevenueRecognitionToErpResponse> {
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

      invoice.addItems(invoiceItems);

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
        invoice.nsReference = 'NON_INVOICEABLE';
        await this.invoiceRepo.update(invoice);
        return right(Result.ok<any>(null));
      }

      const erpResponse = await this.erpService.registerRevenueRecognition({
        manuscript,
        invoice,
        payer,
        publisherCustomValues,
        invoiceTotal: netCharges,
      });

      this.loggerService.info(
        `ERP Revenue Recognized Invoice ${invoice.id.toString()}: revenueRecognitionReference -> ${JSON.stringify(
          erpResponse
        )}`
      );
      invoice[this.erpService.invoiceRevenueRecRefFieldName] = String(
        erpResponse.journal.id
      );

      await this.invoiceRepo.update(invoice);

      return right(Result.ok<any>(erpResponse));
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
