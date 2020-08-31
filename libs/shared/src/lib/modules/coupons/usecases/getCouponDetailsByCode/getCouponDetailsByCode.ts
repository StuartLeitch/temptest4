/* eslint-disable @typescript-eslint/no-unused-vars */
// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { Coupon } from '../../domain/Coupon';
import { CouponCode } from '../../domain/CouponCode';
import { CouponRepoContract } from '../../repos/couponRepo';

// * Usecase specific
import { GetCouponDetailsByCodeResponse } from './getCouponDetailsByCodeResponse';
import { CouponNotFoundError } from './getCouponDetailsByCodeErrors';
import type { GetCouponDetailsByCodeDTO } from './getCouponDetailsByCodeDTO';

export class GetCouponDetailsByCodeUsecase
  implements
    UseCase<
      GetCouponDetailsByCodeDTO,
      Promise<GetCouponDetailsByCodeResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetCouponDetailsByCodeDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private couponRepo: CouponRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:read')
  public async execute(
    request: GetCouponDetailsByCodeDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetCouponDetailsByCodeResponse> {
    let coupon: Coupon;

    const couponCode = CouponCode.create(request.couponCode).getValue();

    try {
      try {
        coupon = await this.couponRepo.getCouponByCode(couponCode);
      } catch (err) {
        return left(new CouponNotFoundError(coupon.code.toString()));
      }

      return right(Result.ok<Coupon>(coupon));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
