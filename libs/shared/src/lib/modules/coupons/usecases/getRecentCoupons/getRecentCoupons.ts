import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { GetRecentCouponsResponse } from './getRecentCouponsResponse';
import type { GetRecentCouponsDTO } from './getRecentCouponsDTO';
import { CouponRepoContract } from '../../repos/couponRepo';

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

      if (paginatedResult.isLeft()) {
        return left(
          new UnexpectedError(new Error(paginatedResult.value.message))
        );
      }

      return right(paginatedResult.value);
    } catch (err) {
      return left(new UnexpectedError(err, 'Getting recent coupons failed.'));
    }
  }
}
