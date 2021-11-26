// * Core Domain
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { CouponRepoContract } from '../../repos/couponRepo';

// * Usecase specific
import { InvoiceItemType } from '../../../invoices/domain/InvoiceItem';

import { CreateCouponResponse as Response } from './createCouponResponse';
import type { CreateCouponDTO as DTO } from './createCouponDTO';
import * as Errors from './createCouponErrors';

import { CouponCode } from '../../domain/CouponCode';
import {
  CouponStatus,
  CouponProps,
  CouponType,
  Coupon,
} from '../../domain/Coupon';
import { CouponMap } from '../../mappers/CouponMap';

import { sanityChecksRequestParameters } from './utils';
import { AuditLoggerServiceContract } from '../../../../infrastructure/audit';

export class CreateCouponUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private couponRepo: CouponRepoContract,
    private auditLoggerService: AuditLoggerServiceContract
  ) {
    super();
    this.createCoupon = this.createCoupon.bind(this);
    this.saveCoupon = this.saveCoupon.bind(this);
  }

  @Authorize('coupon:create')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const finalResult = await new AsyncEither(request)
        .then(sanityChecksRequestParameters(this.couponRepo))
        .then(this.createCoupon)
        .then(this.saveCoupon)
        .execute();

      return finalResult;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async createCoupon(request: DTO) {
    const { code, invoiceItemType, expirationDate, type, status } = request;

    return CouponCode.create(code)
      .map((code) => {
        const now = new Date();
        const props: CouponProps = {
          ...request,
          invoiceItemType: invoiceItemType as InvoiceItemType,
          expirationDate: expirationDate ? new Date(expirationDate) : null,
          couponType: CouponType[type],
          status: CouponStatus[status],
          dateCreated: now,
          dateUpdated: now,
          redeemCount: 0,
          code,
        };
        return props;
      })
      .chain((props) => Coupon.create(props));
  }

  private async saveCoupon(
    coupon: Coupon
  ): Promise<Either<Errors.CouponNotSavedError, Coupon>> {
    try {
      const result = await this.couponRepo.save(coupon);
      if (result.isLeft()) {
        return left(
          new Errors.CouponNotSavedError(new Error(result.value.message))
        );
      }

      // * Save information as audit log
      this.auditLoggerService.log({
        action: 'added new',
        entity: 'coupon',
        timestamp: new Date(),
      });


      return right(result.value);
    } catch (err) {
      return left(new Errors.CouponNotSavedError(err));
    }
  }
}
