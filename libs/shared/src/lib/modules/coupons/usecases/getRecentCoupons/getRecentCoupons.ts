import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { CouponRepoContract } from '../../repos/couponRepo';

import { GetRecentCouponsResponse } from './getRecentCouponsResponse';

import { GetRecentCouponsDTO } from './getRecentCouponsDTO';

import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
  GetRecentCouponsAuthenticationContext,
} from './getRecentCouponsAuthenticationContext';

export class GetRecentCouponsUsecase
  implements
    UseCase<
      {},
      Promise<GetRecentCouponsResponse>,
      GetRecentCouponsAuthenticationContext
    >,
    AccessControlledUsecase<
      GetRecentCouponsDTO,
      GetRecentCouponsAuthenticationContext,
      AccessControlContext
    > {
  constructor(private couponRepo: CouponRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('coupon:read')
  public async execute(
    request: GetRecentCouponsDTO,
    context?: GetRecentCouponsAuthenticationContext
  ): Promise<GetRecentCouponsResponse> {
    try {
      const paginatedResult = await this.couponRepo.getRecentCoupons(request);
      return right(Result.ok(paginatedResult));
    } catch (err) {
      return left(
        new AppError.UnexpectedError(err, 'Getting recent coupons failed.')
      );
    }
  }
}
