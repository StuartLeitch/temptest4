/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../../domain/authorization';
import { ErpInvoiceResponse } from '../../../../../domain/services/ErpService';
import { UseCase } from '../../../../../core/domain/UseCase';
import { right, Result, left, Either } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';

import { LoggerContract } from '../../../../../infrastructure/logging/Logger';
import { InvoiceRepoContract } from '../../../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../../repos/invoiceItemRepo';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';
import { PayerRepoContract } from '../../../../payers/repos/payerRepo';
import { AddressRepoContract } from '../../../../addresses/repos/addressRepo';
import { ArticleRepoContract } from '../../../../manuscripts/repos/articleRepo';
import { CatalogRepoContract } from '../../../../journals/repos';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { ErpReferenceRepoContract } from '../../../../vendors/repos';
import { PublishRevenueRecognitionToErpUsecase } from '../publishRevenueRecognitionToErp/publishRevenueRecognitionToErp';

export type RetryRevenueRecognitionNetsuiteErpInvoicesResponse = Either<
  UnexpectedError,
  Result<ErpInvoiceResponse[]>
>;

export class RetryRevenueRecognitionNetsuiteErpInvoicesUsecase
  implements
    UseCase<
      Record<string, unknown>,
      Promise<RetryRevenueRecognitionNetsuiteErpInvoicesResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      Record<string, unknown>,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  private publishRevenueRecognitionToErpUsecase: PublishRevenueRecognitionToErpUsecase;
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
    private erpReferenceRepo: ErpReferenceRepoContract,
    private netsuiteService: ErpServiceContract,
    private loggerService: LoggerContract
  ) {
    this.publishRevenueRecognitionToErpUsecase = new PublishRevenueRecognitionToErpUsecase(
      this.invoiceRepo,
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo,
      this.payerRepo,
      this.addressRepo,
      this.manuscriptRepo,
      this.catalogRepo,
      this.publisherRepo,
      this.erpReferenceRepo,
      this.netsuiteService,
      this.loggerService
    );
  }

  private async getAccessControlContext(_request: any, _context?: any) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request?: Record<string, unknown>,
    context?: UsecaseAuthorizationContext
  ): Promise<RetryRevenueRecognitionNetsuiteErpInvoicesResponse> {
    try {
      const unrecognizedErpInvoices = await this.invoiceRepo.getUnrecognizedNetsuiteErpInvoices();
      const updatedInvoices: ErpInvoiceResponse[] = [];

      if (unrecognizedErpInvoices.length === 0) {
        this.loggerService.info('No revenue unrecognized invoices');
        return right(Result.ok<ErpInvoiceResponse[]>(updatedInvoices));
      }

      this.loggerService.info(
        `Retrying recognizing in NetSuite for invoices: ${unrecognizedErpInvoices
          .map((i) => i.id.toString())
          .join(', ')}`
      );
      const errs = [];

      for (const unrecognizedInvoice of unrecognizedErpInvoices) {
        const updatedInvoiceResponse = await this.publishRevenueRecognitionToErpUsecase.execute(
          {
            invoiceId: unrecognizedInvoice.id.toString(),
          }
        );
        if (updatedInvoiceResponse.isLeft()) {
          errs.push(updatedInvoiceResponse.value.error);
        } else {
          const assignedErpReference = updatedInvoiceResponse.value.getValue();

          if (assignedErpReference === null) {
            // simply do nothing yet
          } else {
            this.loggerService.info(
              `Invoice ${unrecognizedInvoice.id.toString()} successfully recognized ${
                (assignedErpReference as any).journal?.id
              }`
            );
            updatedInvoices.push(assignedErpReference);
          }
        }
      }

      if (errs.length > 0) {
        console.log(JSON.stringify(errs, null, 2));
        return left(new UnexpectedError(errs, JSON.stringify(errs, null, 2)));
      }

      return right(Result.ok<ErpInvoiceResponse[]>(updatedInvoices));
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
