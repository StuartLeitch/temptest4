import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

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
import { ErpReferenceRepoContract } from '../../../../vendors/repos';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { CatalogRepoContract } from '../../../../journals/repos';
import { InvoiceRepoContract } from '../../../repos/invoiceRepo';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';

import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { ErpRevRecResponse } from '../../../../../domain/services/ErpService';
import { LoggerContract } from '../../../../../infrastructure/logging/Logger';

import { PublishRevenueRecognitionToErpUsecase } from '../publishRevenueRecognitionToErp/publishRevenueRecognitionToErp';

import { RetryRevenueRecognitionSageErpInvoicesResponse as Response } from './retryRevenueRecognitionSageErpInvoicesResponse';
import { RetryRevenueRecognitionSageErpInvoicesDTO as DTO } from './retryRevenueRecognitionSageErpInvoicesDTO';

export class RetryRevenueRecognitionSageErpInvoicesUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
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
    private sageService: ErpServiceContract,
    private loggerService: LoggerContract
  ) {
    super();

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
      this.sageService,
      this.loggerService
    );
  }

  @Authorize('erp:publish')
  public async execute(request?: DTO, context?: Context): Promise<Response> {
    try {
      const maybeUnrecognizedErpInvoices = await this.invoiceRepo.getUnrecognizedSageErpInvoices();

      if (maybeUnrecognizedErpInvoices.isLeft()) {
        return left(
          new UnexpectedError(
            new Error(maybeUnrecognizedErpInvoices.value.message)
          )
        );
      }

      const unrecognizedErpInvoices = maybeUnrecognizedErpInvoices.value;

      const updatedInvoices: ErpRevRecResponse[] = [];

      if (unrecognizedErpInvoices.length === 0) {
        this.loggerService.info('No revenue unrecognized invoices');
        return right(updatedInvoices);
      }

      this.loggerService.info(
        `Retrying recognizing in Sage for invoices: ${unrecognizedErpInvoices
          .map((i) => i.id.toString())
          .join(', ')}`
      );
      const errs = [];

      for (const unrecognizedInvoice of unrecognizedErpInvoices) {
        const updatedInvoiceResponse = await this.publishRevenueRecognitionToErpUsecase.execute(
          {
            invoiceId: unrecognizedInvoice.id.toString(),
          },
          context
        );
        if (updatedInvoiceResponse.isLeft()) {
          errs.push(updatedInvoiceResponse.value);
        } else {
          const assignedErpReference = updatedInvoiceResponse.value;

          if (assignedErpReference === null) {
            // simply do nothing yet
          } else {
            const { sage, netSuite } = assignedErpReference as any;
            this.loggerService.info(
              `Invoice ${unrecognizedInvoice.id.toString()} successfully recognized in Sage ${sage}`
            );
            this.loggerService.info(
              `Invoice ${unrecognizedInvoice.id.toString()} successfully recognized in NetSuite ${netSuite}`
            );
            updatedInvoices.push(assignedErpReference);
          }
        }
      }

      if (errs.length > 0) {
        errs.forEach(this.loggerService.error);
        return left(new UnexpectedError(errs, JSON.stringify(errs, null, 2)));
      }

      return right(updatedInvoices);
    } catch (err) {
      this.loggerService.error(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
