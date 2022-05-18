import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

import { LoggerContract } from '../../../../../infrastructure/logging';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../../domain/authorization';

import { ArticleRepoContract } from '../../../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../../addresses/repos/addressRepo';
import { InvoiceItemRepoContract } from '../../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../../payers/repos/payerRepo';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { CatalogRepoContract } from '../../../../journals/repos';
import { InvoiceRepoContract } from '../../../repos/invoiceRepo';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';
import { ErpReferenceRepoContract } from './../../../../vendors/repos/ErpReferenceRepo';

import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { VATService } from '../../../../../domain/services/VATService';

import { PublishInvoiceToErpUsecase } from '../publishInvoiceToErp/publishInvoiceToErp';

import { ErpInvoiceResponse } from '../../../../../domain/services/ErpService';

import { RetryFailedSageErpInvoicesResponse as Response } from './retryFailedSageErpInvoicesResponse';
import type { RetryFailedSageErpInvoicesDTO as DTO } from './retryFailedSageErpInvoicesDTO';

export class RetryFailedSageErpInvoicesUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
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
    private sageService: ErpServiceContract,
    private publisherRepo: PublisherRepoContract,
    private loggerService: LoggerContract,
    private vatService: VATService
  ) {
    super();

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
      this.sageService,
      this.publisherRepo,
      this.loggerService,
      this.vatService
    );
  }

  @Authorize('erp:publish')
  public async execute(request?: DTO, context?: Context): Promise<Response> {
    try {
      const maybeFailedErpInvoicesIds =
        await this.invoiceRepo.getFailedSageErpInvoices();

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
        this.loggerService.info('No failed invoices to register in Sage');
        return right(updatedInvoices);
      }
      this.loggerService.info(
        `Retrying sync with Sage for invoices: ${failedErpInvoicesIds
          .map((i) => i.id.toString())
          .join(', ')}`
      );

      const errs = [];

      for (const failedInvoice of failedErpInvoicesIds) {
        const maybeUpdatedInvoiceResponse =
          await this.publishToErpUsecase.execute(
            {
              invoiceId: failedInvoice.id.toString(),
            },
            context
          );

        if (
          typeof maybeUpdatedInvoiceResponse.isLeft === 'function' &&
          maybeUpdatedInvoiceResponse.isLeft()
        ) {
          return left(maybeUpdatedInvoiceResponse.value);
        }

        const updatedInvoiceResponse = maybeUpdatedInvoiceResponse.value;

        const assignedErpReference =
          updatedInvoiceResponse as ErpInvoiceResponse;

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
        errs.forEach(this.loggerService.error);
        return left(new UnexpectedError(errs, JSON.stringify(errs)));
      }

      return right(updatedInvoices);
    } catch (err) {
      this.loggerService.error(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
