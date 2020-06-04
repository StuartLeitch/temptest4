/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  AuthorizationContext,
  Roles,
  AccessControlledUsecase,
  AccessControlContext,
  ErpResponse,
} from '@hindawi/shared';
import { UseCase } from '../../../../core/domain/UseCase';
import { right, Result, left, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

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
  AppError.UnexpectedError,
  Result<ErpResponse[]>
>;

export type RetryFailedErpInvoicesContext = AuthorizationContext<Roles>;

export class RetryFailedErpInvoicesUsecase
  implements
    UseCase<
      Record<string, unknown>,
      Promise<RetryFailedErpInvoicesResponse>,
      RetryFailedErpInvoicesContext
    >,
    AccessControlledUsecase<
      Record<string, unknown>,
      RetryFailedErpInvoicesContext,
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
    private erpService: ErpServiceContract,
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
      this.erpService,
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
    context?: RetryFailedErpInvoicesContext
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
        return left(new AppError.UnexpectedError(errs));
      }

      return right(Result.ok<ErpResponse[]>(updatedInvoices));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
