/* eslint-disable @typescript-eslint/no-unused-vars */

import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { CouponRepoContract } from '../../repos/couponRepo';
import { GetRecentCouponsResponse } from './getRecentCouponsResponse';
import type { GetRecentCouponsDTO } from './getRecentCouponsDTO';

export class GetRecentCouponsUsecase
  implements
    UseCase<
      Record<string, unknown>,
      Promise<GetRecentCouponsResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetRecentCouponsDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private couponRepo: CouponRepoContract) {}

  private async getAccessControlContext() {
    return {};
  }

  @Authorize('coupon:read')
  public async execute(
    request: GetRecentCouponsDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetRecentCouponsResponse> {
    try {
      const paginatedResult = await this.couponRepo.getRecentCoupons(request);
      return right(Result.ok(paginatedResult));
    } catch (err) {
      return left(new UnexpectedError(err, 'Getting recent coupons failed.'));
    }
  }
}
