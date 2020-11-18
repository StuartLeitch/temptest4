/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

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
import { PublishPaymentToErpResponse } from './publishPaymentToErpResponse';
import { ErpReferenceRepoContract } from '../../../vendors/repos';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';
import { Invoice } from '../../../invoices/domain/Invoice';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { ErpReferenceMap } from '../../../vendors/mapper/ErpReference';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { CatalogRepoContract } from '../../../journals/repos';
import { JournalId } from '../../../journals/domain/JournalId';
import { PublisherRepoContract } from '../../../publishers/repos';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { InvoiceItemRepoContract } from './../../../invoices/repos/invoiceItemRepo';
import { PaymentRepoContract } from './../../repos/paymentRepo';
import { PaymentMethodRepoContract } from './../../repos/paymentMethodRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos';
import { GetItemsForInvoiceUsecase } from './../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';

export interface PublishPaymentToErpRequestDTO {
  invoiceId?: string;
  total?: number;
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
    private manuscriptRepo: ArticleRepoContract,
    private catalogRepo: CatalogRepoContract,
    private erpReferenceRepo: ErpReferenceRepoContract,
    private erpService: ErpServiceContract,
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
        // invoice.erpReference = 'NON_INVOICEABLE';
        await this.invoiceRepo.update(invoice);
        return right(null);
      }

      const payer = await this.payerRepo.getPayerByInvoiceId(invoice.invoiceId);
      if (!payer) {
        throw new Error(`Invoice ${invoice.id} has no payers.`);
      }

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

      try {
        const erpData = {
          invoice,
          payer,
          paymentMethods,
          payments,
          total: request.total,
          items: invoiceItems,
          manuscript: manuscript as any,
          tradeDocumentItemProduct: publisherCustomValues.tradeDocumentItem,
          customSegmentId: publisherCustomValues?.customSegmentId,
          itemId: publisherCustomValues?.itemId,
        };

        const [payment] = payments;

        let erpResponse;
        try {
          erpResponse = await this.erpService.registerPayment(erpData);

          if (erpResponse) {
            this.loggerService.info(
              `Updating invoice ${invoice.id.toString()}: paymentReference -> ${JSON.stringify(
                erpResponse
              )}`
            );
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

        this.loggerService.info('PublishPaymentToERP final payment', payment);
        await this.paymentRepo.updatePayment(payment);

        const erpReference = ErpReferenceMap.toDomain({
          entity_id: payment.paymentId.id.toString(),
          type: 'payment',
          vendor: this.erpService.vendorName,
          attribute: 'erp',
          value: String(erpResponse),
        });
        await this.erpReferenceRepo.save(erpReference);

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
