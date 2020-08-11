/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { Result, left } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';
import { map } from '../../../../core/logic/EitherMap';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { CouponRepoContract } from '../../repos/couponRepo';

// * Usecase specific
import { InvoiceItemType } from '../../../invoices/domain/InvoiceItem';

import { CreateCouponResponse } from './createCouponResponse';
import { CreateCouponDTO } from './createCouponDTO';

import { CouponCode } from '../../domain/CouponCode';
import {
  CouponStatus,
  CouponProps,
  CouponType,
  Coupon,
} from '../../domain/Coupon';

import { sanityChecksRequestParameters } from './utils';

export class CreateCouponUsecase
  implements
    UseCase<
      CreateCouponDTO,
      Promise<CreateCouponResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      CreateCouponDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private couponRepo: CouponRepoContract) {}

  // @Authorize('coupon:create')
  public async execute(
    request: CreateCouponDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<CreateCouponResponse> {
    try {
      const maybeSaneRequest = await sanityChecksRequestParameters(
        request,
        this.couponRepo
      );

      const maybeSavedCoupon = await map(
        [this.createCoupon.bind(this), this.saveCoupon.bind(this)],
        maybeSaneRequest
      );

      const finalResult = maybeSavedCoupon.map((coupon) => Result.ok(coupon));

      return (finalResult as unknown) as CreateCouponResponse;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  private async createCoupon(request: CreateCouponDTO): Promise<Coupon> {
    const { code, invoiceItemType, expirationDate, type, status } = request;

    const couponCode = CouponCode.create(code).getValue();
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
      code: couponCode,
    };

    const coupon = Coupon.create(props);
    return coupon.getValue();
  }

  private async saveCoupon(coupon: Coupon): Promise<Coupon> {
    return this.couponRepo.save(coupon);
  }
}
