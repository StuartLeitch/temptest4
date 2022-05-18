import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { ErrorUtils } from '../../../../utils/ErrorUtils';

import { LoggerContract } from '../../../../infrastructure/logging';

import {
  RegisterPaymentResponse,
  ErpServiceContract,
} from '../../../../domain/services/ErpService';

import { ArticleRepoContract as ManuscriptRepoContract } from './../../../manuscripts/repos/articleRepo';

import { ErpReferenceRepoContract } from './../../../vendors/repos/ErpReferenceRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { CatalogRepoContract } from './../../../journals/repos/catalogRepo';
import { PaymentMethodRepoContract } from './../../repos/paymentMethodRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { PayerRepoContract } from './../../../payers/repos/payerRepo';
import { PaymentRepoContract } from './../../repos/paymentRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import { PublishPaymentToErpUsecase } from '../publishPaymentToErp/publishPaymentToErp';

import { RetryPaymentsRegistrationToErpResponse as Response } from './retryPaymentRegistrationResponse';
import { RetryPaymentsRegistrationToErpDTO as DTO } from './retryPaymentRegistrationDTO';

export class RetryPaymentsRegistrationToErpUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
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
    private loggerService: LoggerContract
  ) {
    super();

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
      this.loggerService
    );
  }

  public async execute(request?: DTO, context?: Context): Promise<Response> {
    try {
      const paymentIds = await this.paymentRepo.getUnregisteredErpPayments();
      const registeredPayments: RegisterPaymentResponse[] = [];

      if (paymentIds.length === 0) {
        this.loggerService.info('No registered payments to be register!');
        return right(registeredPayments);
      }

      this.loggerService.info(
        `Retrying registration in NetSuite for payments: ${paymentIds
          .map((i) => i.id.toString())
          .join(', ')}`
      );

      const errs = [];

      for (const paymentId of paymentIds) {
        const publishedPaymentResponse =
          await this.publishPaymentToErpUsecase.execute(
            {
              paymentId: paymentId.id.toString(),
            },
            context
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

      return right(registeredPayments);
    } catch (err) {
      this.loggerService.error(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
