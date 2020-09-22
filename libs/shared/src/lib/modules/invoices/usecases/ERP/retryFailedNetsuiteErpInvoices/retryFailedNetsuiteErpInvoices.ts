/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { UseCase } from '../../../../../core/domain/UseCase';
import { right, left, Either } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../../domain/authorization';
import { ErpResponse } from '../../../../../domain/services/ErpService';

import { InvoiceRepoContract } from '../../../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../../repos/invoiceItemRepo';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';
import { PayerRepoContract } from '../../../../payers/repos/payerRepo';
import { AddressRepoContract } from '../../../../addresses/repos/addressRepo';
import { ArticleRepoContract } from '../../../../manuscripts/repos/articleRepo';
import { CatalogRepoContract } from '../../../../journals/repos';
import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { PublishInvoiceToErpUsecase } from '../publishInvoiceToErp/publishInvoiceToErp';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { LoggerContract } from '../../../../../infrastructure/logging/Logger';
import { VATService } from 'libs/shared/src/lib/domain/services/VATService';

export type RetryFailedNetsuiteErpInvoicesResponse = Either<
  UnexpectedError | ErpResponse,
  ErpResponse[]
>;

export class RetryFailedNetsuiteErpInvoicesUsecase
  implements
    UseCase<
      Record<string, unknown>,
      Promise<RetryFailedNetsuiteErpInvoicesResponse>,
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
      this.netSuiteService,
      this.publisherRepo,
      this.loggerService,
      this.vatService
    );
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request?: Record<string, unknown>,
    context?: UsecaseAuthorizationContext
  ): Promise<RetryFailedNetsuiteErpInvoicesResponse> {
    try {
      const failedErpInvoices = await this.invoiceRepo.getFailedSageErpInvoices();

      const updatedInvoices: ErpResponse[] = [];

      if (failedErpInvoices.length === 0) {
        this.loggerService.info('No failed erp invoices');
        return right(updatedInvoices);
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

        if (
          typeof maybeUpdatedInvoiceResponse.isLeft === 'function' &&
          maybeUpdatedInvoiceResponse.isLeft()
        ) {
          return left(updatedInvoiceResponse);
        }
        const assignedErpReference = updatedInvoiceResponse as ErpResponse;

        // console.log('Assigned ERP Reference:');
        // console.info('type ', typeof assignedErpReference);
        // console.info(assignedErpReference);

        if (assignedErpReference) {
          console.log(
            `Assigned successfully ${
              assignedErpReference?.tradeDocumentId
            } to invoice ${failedInvoice.invoiceId.id.toString()}`
          );
          updatedInvoices.push(assignedErpReference);
        }
      }

      if (errs.length > 0) {
        console.log(JSON.stringify(errs, null, 2));
        return left(new UnexpectedError(errs, JSON.stringify(errs)));
      }

      return right(updatedInvoices);
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
