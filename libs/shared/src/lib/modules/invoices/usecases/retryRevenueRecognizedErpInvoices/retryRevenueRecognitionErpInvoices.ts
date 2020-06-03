/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
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
import { PublisherRepoContract } from '../../../publishers/repos';
import { ErpServiceContract } from '../../../../domain/services/ErpService';
import { PublishRevenueRecognitionToErpUsecase } from '../publishRevenueRecognitionToErp/publishRevenueRecognitionToErp';

export type RetryRevenueRecognitionErpInvoicesResponse = Either<
  AppError.UnexpectedError,
  Result<ErpResponse[]>
>;

export type RetryRevenueRecognitionErpInvoicesContext = AuthorizationContext<
  Roles
>;

export class RetryRevenueRecognitionErpInvoicesUsecase
  implements
    UseCase<
      {},
      Promise<RetryRevenueRecognitionErpInvoicesResponse>,
      RetryRevenueRecognitionErpInvoicesContext
    >,
    AccessControlledUsecase<
      {},
      RetryRevenueRecognitionErpInvoicesContext,
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
    private erpService: ErpServiceContract,
    private loggerService: any
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
      this.erpService,
      this.loggerService
    );
  }

  private async getAccessControlContext(request: any, context?: any) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request?: any,
    context?: RetryRevenueRecognitionErpInvoicesContext
  ): Promise<RetryRevenueRecognitionErpInvoicesResponse> {
    try {
      const unrecognizedErpInvoices = await this.invoiceRepo.getUnrecognizedErpInvoices();
      const updatedInvoices: ErpResponse[] = [];

      if (unrecognizedErpInvoices.length === 0) {
        this.loggerService.info('No revenue unrecognized invoices');
        return right(Result.ok<ErpResponse[]>(updatedInvoices));
      }

      this.loggerService.info(
        `Retrying recognizing in erp for invoices: ${unrecognizedErpInvoices
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
        return left(new AppError.UnexpectedError(errs));
      }

      return right(Result.ok<ErpResponse[]>(updatedInvoices));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
