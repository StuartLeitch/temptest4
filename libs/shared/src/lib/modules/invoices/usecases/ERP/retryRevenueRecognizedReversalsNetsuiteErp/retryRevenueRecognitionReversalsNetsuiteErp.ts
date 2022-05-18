import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

import { ErrorUtils } from '../../../../../utils/ErrorUtils';

import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';

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
import { CreditNoteRepoContract } from '../../../../creditNotes/repos/creditNoteRepo';

import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { ErpRevRecResponse } from '../../../../../domain/services/ErpService';
import { LoggerContract } from '../../../../../infrastructure/logging';

import { PublishRevenueRecognitionReversalUsecase } from '../publishRevenueRecognitionReversal/publishRevenueRecognitionReversal';

import { RetryRevenueRecognitionReversalsNetsuiteErpResponse as Response } from './retryRevenueRecognitionReversalsNetsuiteErpResponse';
import { RetryRevenueRecognitionReversalsNetsuiteErpDTO as DTO } from './retryRevenueRecognitionReversalsNetsuiteErpDTO';

export class RetryRevenueRecognitionReversalsNetsuiteErpUsecase
  implements UseCase<DTO, Promise<Response>, Context>
{
  private publishRevenueRecognitionReversalUsecase: PublishRevenueRecognitionReversalUsecase;
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
    private creditNoteRepo: CreditNoteRepoContract,
    private erpReferenceRepo: ErpReferenceRepoContract,
    private netsuiteService: ErpServiceContract,
    private loggerService: LoggerContract
  ) {
    this.publishRevenueRecognitionReversalUsecase =
      new PublishRevenueRecognitionReversalUsecase(
        this.invoiceRepo,
        this.invoiceItemRepo,
        this.couponRepo,
        this.waiverRepo,
        this.payerRepo,
        this.addressRepo,
        this.manuscriptRepo,
        this.catalogRepo,
        this.publisherRepo,
        this.creditNoteRepo,
        this.erpReferenceRepo,
        this.netsuiteService,
        this.loggerService
      );
  }

  public async execute(request?: DTO, context?: Context): Promise<Response> {
    try {
      const maybeUnrecognizedReversalsErpInvoicesIds =
        await this.invoiceRepo.getUnrecognizedReversalsNetsuiteErp();

      if (maybeUnrecognizedReversalsErpInvoicesIds.isLeft()) {
        return left(
          new UnexpectedError(
            new Error(maybeUnrecognizedReversalsErpInvoicesIds.value.message)
          )
        );
      }

      const unrecognizedErpReversalsIds =
        maybeUnrecognizedReversalsErpInvoicesIds.value;

      const updatedReversals: ErpRevRecResponse[] = [];

      if (unrecognizedErpReversalsIds.length === 0) {
        this.loggerService.info('No revenue recognition reversals');
        return right(updatedReversals);
      }

      this.loggerService.info(
        `Retrying revenue recognition reversals in NetSuite for invoices: ${unrecognizedErpReversalsIds
          .map((i) => i.id.toString())
          .join(', ')}`
      );
      const errs = [];

      for (const unrecognizedReversal of unrecognizedErpReversalsIds) {
        const updatedReversalResponse =
          await this.publishRevenueRecognitionReversalUsecase.execute(
            {
              invoiceId: unrecognizedReversal.id.toString(),
            },
            context
          );
        if (updatedReversalResponse.isLeft()) {
          errs.push(updatedReversalResponse.value);
        } else {
          const assignedErpReference = updatedReversalResponse.value;

          if (assignedErpReference === null) {
            // simply do nothing yet
          } else {
            this.loggerService.info(
              `Reversal ${unrecognizedReversal.id.toString()} successfully recognized ${
                (assignedErpReference as any).journal?.id
              }`
            );
            updatedReversals.push(assignedErpReference);
          }
        }
      }

      if (errs.length > 0) {
        ErrorUtils.handleErpErrors(errs, this.loggerService);
        return left(new UnexpectedError(errs, JSON.stringify(errs, null, 2)));
      }

      return right(updatedReversals);
    } catch (err) {
      this.loggerService.error(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
