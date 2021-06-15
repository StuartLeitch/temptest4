import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

import { LoggerContract } from '../../../../../infrastructure/logging/Logger';

import { ErrorUtils } from './../../../../../utils/ErrorUtils';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';

import { ErpReferenceRepoContract } from './../../../../vendors/repos/ErpReferenceRepo';
import { ArticleRepoContract } from '../../../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../../addresses/repos/addressRepo';
import { InvoiceItemRepoContract } from '../../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../../payers/repos/payerRepo';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { CatalogRepoContract } from '../../../../journals/repos';
import { InvoiceRepoContract } from '../../../repos/invoiceRepo';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';

import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { VATService } from '../../../../../domain/services/VATService';

import { PublishInvoiceToErpUsecase } from '../publishInvoiceToErp/publishInvoiceToErp';

import { ErpInvoiceResponse } from '../../../../../domain/services/ErpService';

import { RetryFailedNetsuiteErpInvoicesResponse as Response } from './retryFailedNetsuiteErpInvoicesResponse';
import { RetryFailedNetsuiteErpInvoicesDTO as DTO } from './retryFailedNetsuiteErpInvoicesDTO';

export class RetryFailedNetsuiteErpInvoicesUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  private publishToErpUsecase: PublishInvoiceToErpUsecase;
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
    private netSuiteService: ErpServiceContract,
    private publisherRepo: PublisherRepoContract,
    private loggerService: LoggerContract,
    private vatService: VATService
  ) {
    this.publishToErpUsecase = new PublishInvoiceToErpUsecase(
      this.invoiceRepo,
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo,
      this.payerRepo,
      this.addressRepo,
      this.manuscriptRepo,
      this.catalogRepo,
      this.erpReferenceRepo,
      this.netSuiteService,
      this.publisherRepo,
      this.loggerService,
      this.vatService
    );
  }

  public async execute(request?: DTO, context?: Context): Promise<Response> {
    try {
      const maybeFailedErpInvoicesIds = await this.invoiceRepo.getFailedNetsuiteErpInvoices();

      if (maybeFailedErpInvoicesIds.isLeft()) {
        return left(
          new UnexpectedError(
            new Error(maybeFailedErpInvoicesIds.value.message)
          )
        );
      }

      const failedErpInvoicesIds = maybeFailedErpInvoicesIds.value;

      const updatedInvoices: ErpInvoiceResponse[] = [];

      if (failedErpInvoicesIds.length === 0) {
        this.loggerService.info('No failed invoices to register in NetSuite');
        return right(updatedInvoices);
      }

      this.loggerService.info(
        `Retrying sync with NetSuite for invoices: ${failedErpInvoicesIds
          .map((i) => i.id.toString())
          .join(', ')}`
      );

      const errs = [];

      for (const failedInvoice of failedErpInvoicesIds) {
        const maybeUpdatedInvoiceResponse = await this.publishToErpUsecase.execute(
          {
            invoiceId: failedInvoice.id.toString(),
          }
        );

        const updatedInvoiceResponse = maybeUpdatedInvoiceResponse.value;

        if (
          typeof maybeUpdatedInvoiceResponse.isLeft === 'function' &&
          maybeUpdatedInvoiceResponse.isLeft()
        ) {
          errs.push(updatedInvoiceResponse);
          return left(updatedInvoiceResponse);
        }
        const assignedErpReference = updatedInvoiceResponse as ErpInvoiceResponse;

        if (assignedErpReference) {
          this.loggerService.info(
            `Assigned successfully ${
              assignedErpReference?.tradeDocumentId
            } to invoice ${failedInvoice.id.toString()}`
          );
          updatedInvoices.push(assignedErpReference);
        }
      }

      if (errs.length > 0) {
        ErrorUtils.handleErpErrors(errs, this.loggerService);
        return left(new UnexpectedError(errs, JSON.stringify(errs, null, 2)));
      }

      return right(updatedInvoices);
    } catch (err) {
      this.loggerService.error(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
