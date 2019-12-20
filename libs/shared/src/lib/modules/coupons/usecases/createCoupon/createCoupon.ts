// * Core Domain
import { Result, left } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';
import { map } from '../../../../core/logic/EitherMap';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import { CouponRepoContract } from '../../repos/couponRepo';

// * Usecase specific
import { InvoiceItemType } from '../../../invoices/domain/InvoiceItem';

import { CreateCouponResponse } from './createCouponResponse';
import { CreateCouponErrors } from './createCouponErrors';
import { CreateCouponDTO } from './createCouponDTO';

import { CouponCode } from '../../domain/CouponCode';
import {
  CouponStatus,
  CouponProps,
  CouponType,
  Coupon
} from '../../domain/Coupon';

import { sanityChecksRequestParameters } from './utils';

export type CreateCouponContext = AuthorizationContext<Roles>;

export class CreateCouponUsecase
  implements
    UseCase<
      CreateCouponDTO,
      Promise<CreateCouponResponse>,
      CreateCouponContext
    >,
    AccessControlledUsecase<
      CreateCouponDTO,
      CreateCouponContext,
      AccessControlContext
    > {
  constructor(private couponRepo: CouponRepoContract) {}

  // @Authorize('coupon:create')
  public async execute(
    request: CreateCouponDTO,
    context?: CreateCouponContext
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
      const finalResult = maybeSavedCoupon.map(coupon => Result.ok(coupon));

      return (finalResult as unknown) as CreateCouponResponse;
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  private async createCoupon(request: CreateCouponDTO): Promise<Coupon> {
    const code = request.code
      ? CouponCode.create(request.code).getValue()
      : await this.generateUniqueCouponCode();
    const now = new Date();
    const props: CouponProps = {
      ...request,
      invoiceItemType: request.invoiceItemType as InvoiceItemType,
      expirationDate: new Date(request.expirationDate),
      couponType: CouponType[request.couponType],
      status: CouponStatus[request.status],
      dateCreated: now,
      dateUpdated: now,
      redeemCount: 0,
      code
    };

    const coupon = Coupon.create(props);
    return coupon.getValue();
  }

  private async generateUniqueCouponCode(): Promise<CouponCode> {
    const found = false;
    while (!found) {
      const code = CouponCode.generateCouponCode();
      const isCodeDuplicate = await this.couponRepo.isCodeUsed(code);
      if (!isCodeDuplicate) {
        return code;
      }
    }
  }

  private async saveCoupon(coupon: Coupon): Promise<Coupon> {
    return this.couponRepo.save(coupon);
  }
}
