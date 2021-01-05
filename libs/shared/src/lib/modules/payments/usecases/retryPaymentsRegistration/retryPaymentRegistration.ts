/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';
import {
  ErpInvoiceResponse,
  RegisterPaymentResponse,
} from '../../../../domain/services/ErpService';
import { UseCase } from '../../../../core/domain/UseCase';
import { right, Result, left, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { ErrorUtils } from '../../../../utils/ErrorUtils';

import { PaymentMethodRepoContract } from './../../repos/paymentMethodRepo';
import { PaymentRepoContract } from './../../repos/paymentRepo';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';
import { ErpServiceContract } from '../../../../domain/services/ErpService';
import { PublisherRepoContract } from './../../../publishers/repos/publisherRepo';
import { CatalogRepoContract } from './../../../journals/repos/catalogRepo';
import { ArticleRepoContract as ManuscriptRepoContract } from './../../../manuscripts/repos/articleRepo';
import { PayerRepoContract } from './../../../payers/repos/payerRepo';
import { ErpReferenceRepoContract } from './../../../vendors/repos/ErpReferenceRepo';

import { PublishPaymentToErpUsecase } from '../publishPaymentToErp/publishPaymentToErp';

export type RetryPaymentsRegistrationToErpResponse = Either<
  UnexpectedError,
  Result<RegisterPaymentResponse[]>
>;

export class RetryPaymentsRegistrationToErpUsecase
  implements
    UseCase<
      Record<string, unknown>,
      Promise<RetryPaymentsRegistrationToErpResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      Record<string, unknown>,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  private publishPaymentToErpUsecase: PublishPaymentToErpUsecase;
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private paymentRepo: PaymentRepoContract,
    private paymentMethodRepo: PaymentMethodRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private manuscriptRepo: ManuscriptRepoContract,
    private catalogRepo: CatalogRepoContract,
    private erpReferenceRepo: ErpReferenceRepoContract,
    private netsuiteService: ErpServiceContract,
    private publisherRepo: PublisherRepoContract,
    private loggerService: LoggerContract
  ) {
    this.publishPaymentToErpUsecase = new PublishPaymentToErpUsecase(
      this.invoiceRepo,
      this.invoiceItemRepo,
      this.paymentRepo,
      this.paymentMethodRepo,
      this.couponRepo,
      this.waiverRepo,
      this.payerRepo,
      this.manuscriptRepo,
      this.catalogRepo,
      this.erpReferenceRepo,
      this.netsuiteService,
      this.publisherRepo,
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
  ): Promise<RetryPaymentsRegistrationToErpResponse> {
    try {
      const paymentIds = await this.paymentRepo.getUnregisteredErpPayments();
      const registeredPayments: RegisterPaymentResponse[] = [];

      if (paymentIds.length === 0) {
        this.loggerService.info('No registered payments to be register!');
        return right(Result.ok<RegisterPaymentResponse[]>(registeredPayments));
      }

      this.loggerService.info(
        `Retrying registration in NetSuite for payments: ${paymentIds
          .map((i) => i.id.toString())
          .join(', ')}`
      );
      const errs = [];

      for (const paymentId of paymentIds) {
        const publishedPaymentResponse = await this.publishPaymentToErpUsecase.execute(
          {
            paymentId: paymentId.id.toString(),
          }
        );
        if (publishedPaymentResponse.isLeft()) {
          errs.push(publishedPaymentResponse.value);
        } else {
          this.loggerService.info(
            `Payment ${paymentId.id.toString()} successfully registered ${
              publishedPaymentResponse.value.paymentReference
            }`
          );
          registeredPayments.push(publishedPaymentResponse.value);
        }
      }

      if (errs.length > 0) {
        ErrorUtils.handleErpErrors(errs, this.loggerService);
        return left(new UnexpectedError(errs, JSON.stringify(errs, null, 2)));
      }

      return right(Result.ok<RegisterPaymentResponse[]>(registeredPayments));
    } catch (err) {
      this.loggerService.error(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
