import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

import { ErrorUtils } from './../../../../../utils/ErrorUtils';

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
import { ErpReferenceRepoContract } from '../../../../vendors/repos';
import { InvoiceRepoContract } from '../../../repos/invoiceRepo';
import { CatalogRepoContract } from '../../../../journals/repos';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';

import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { ErpRevRecResponse } from '../../../../../domain/services/ErpService';
import { LoggerContract } from '../../../../../infrastructure/logging/Logger';

import { PublishRevenueRecognitionToErpUsecase } from '../publishRevenueRecognitionToErp/publishRevenueRecognitionToErp';

import { RetryRevenueRecognitionNetsuiteErpInvoicesResponse as Response } from './retryRevenueRecognitionNetsuiteErpInvoicesResponse';
import type { RetryRevenueRecognitionNetsuiteErpInvoicesDTO as DTO } from './retryRevenueRecognitionNetsuiteErpInvoicesDTO';

export class RetryRevenueRecognitionNetsuiteErpInvoicesUsecase
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
    private netsuiteService: ErpServiceContract,
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
      this.netsuiteService,
      this.loggerService
    );
  }

  @Authorize('erp:publish')
  public async execute(request?: DTO, context?: Context): Promise<Response> {
    try {
      const maybeUnrecognizedErpInvoicesIds = await this.invoiceRepo.getUnrecognizedNetsuiteErpInvoices();

      if (maybeUnrecognizedErpInvoicesIds.isLeft()) {
        return left(
          new UnexpectedError(
            new Error(maybeUnrecognizedErpInvoicesIds.value.message)
          )
        );
      }

      const unrecognizedErpInvoicesIds = maybeUnrecognizedErpInvoicesIds.value;

      const updatedInvoices: ErpRevRecResponse[] = [];

      if (unrecognizedErpInvoicesIds.length === 0) {
        this.loggerService.info('No revenue unrecognized invoices');
        return right(updatedInvoices);
      }

      this.loggerService.info(
        `Retrying recognizing in NetSuite for invoices: ${unrecognizedErpInvoicesIds
          .map((i) => i.id.toString())
          .join(', ')}`
      );
      const errs = [];

      for (const unrecognizedInvoice of unrecognizedErpInvoicesIds) {
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
