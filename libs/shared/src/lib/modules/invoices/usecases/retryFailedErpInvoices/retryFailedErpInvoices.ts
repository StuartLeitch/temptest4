/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { UseCase } from '../../../../core/domain/UseCase';
import { right, Result, left, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';
import { ErpResponse } from './../../../../domain/services/ErpService';

import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { CatalogRepoContract } from '../../../journals/repos';
import { ErpServiceContract } from '../../../../domain/services/ErpService';
import { PublishInvoiceToErpUsecase } from '../publishInvoiceToErp/publishInvoiceToErp';
import { PublisherRepoContract } from '../../../publishers/repos';
import { LoggerContract } from './../../../../infrastructure/logging/Logger';

export type RetryFailedErpInvoicesResponse = Either<
  UnexpectedError,
  Result<ErpResponse[]>
>;

export class RetryFailedErpInvoicesUsecase
  implements
    UseCase<
      Record<string, unknown>,
      Promise<RetryFailedErpInvoicesResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      Record<string, unknown>,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
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
    private sageService: ErpServiceContract,
    private netSuiteService: ErpServiceContract,
    private publisherRepo: PublisherRepoContract,
    private loggerService: LoggerContract
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
      this.sageService,
      this.netSuiteService,
      this.publisherRepo,
      this.loggerService
    );
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request?: Record<string, unknown>,
    context?: UsecaseAuthorizationContext
  ): Promise<RetryFailedErpInvoicesResponse> {
    try {
      const failedErpInvoices = await this.invoiceRepo.getFailedErpInvoices();

      const updatedInvoices: ErpResponse[] = [];

      if (failedErpInvoices.length === 0) {
        this.loggerService.info('No failed erp invoices');
        return right(Result.ok<ErpResponse[]>(updatedInvoices));
      }
      this.loggerService.info(
        `Retrying sync with erp for invoices: ${failedErpInvoices
          .map((i) => i.invoiceId.id.toString())
          .join(', ')}`
      );
      const errs = [];

      for (const failedInvoice of failedErpInvoices) {
        const maybeUpdatedInvoiceResponse = await this.publishToErpUsecase.execute(
          {
            invoiceId: failedInvoice.invoiceId.id.toString(),
          }
        );

        const updatedInvoiceResponse = maybeUpdatedInvoiceResponse.value;

        if (maybeUpdatedInvoiceResponse.isLeft()) {
          return left(updatedInvoiceResponse);
        }
        const assignedErpReference = updatedInvoiceResponse;

        if (assignedErpReference === null) {
          // simply do nothing yet
        } else {
          console.log(
            `Assigned successfully ${
              assignedErpReference.tradeDocumentId
            } to invoice ${failedInvoice.invoiceId.id.toString()}`
          );
          updatedInvoices.push(assignedErpReference);
        }
      }

      if (errs.length > 0) {
        console.log(JSON.stringify(errs, null, 2));
        return left(new UnexpectedError(errs, JSON.stringify(errs)));
      }

      return right(Result.ok<ErpResponse[]>(updatedInvoices));
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
