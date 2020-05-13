// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';

// * Authorization Logic
import {
  Authorize,
  AccessControlledUsecase,
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';

import { Coupon } from '../../domain/Coupon';
import { CouponCode } from '../../domain/CouponCode';
import { CouponRepoContract } from '../../repos/couponRepo';

// * Usecase specific
import { GetCouponDetailsByCodeResponse } from './getCouponDetailsByCodeResponse';
import { CouponNotFoundError } from './getCouponDetailsByCodeErrors';
import { GetCouponDetailsByCodeDTO } from './getCouponDetailsByCodeDTO';
import { GetCouponDetailsByCodeAuthenticationContext } from './getCouponDetailsByCodeAuthenticationContext';

export class GetCouponDetailsByCodeUsecase
  implements
    UseCase<
      GetCouponDetailsByCodeDTO,
      Promise<GetCouponDetailsByCodeResponse>,
      GetCouponDetailsByCodeAuthenticationContext
    >,
    AccessControlledUsecase<
      GetCouponDetailsByCodeDTO,
      GetCouponDetailsByCodeAuthenticationContext,
      AccessControlContext
    > {
  constructor(private couponRepo: CouponRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:read')
  public async execute(
    request: GetCouponDetailsByCodeDTO,
    context?: GetCouponDetailsByCodeAuthenticationContext
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
      return left(new AppError.UnexpectedError(err));
    }
  }
}
