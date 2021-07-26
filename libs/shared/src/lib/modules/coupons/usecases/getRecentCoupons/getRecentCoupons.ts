import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { CouponRepoContract } from '../../repos/couponRepo';

import { GetRecentCouponsResponse as Response } from './getRecentCouponsResponse';
import type { GetRecentCouponsDTO as DTO } from './getRecentCouponsDTO';

export class GetRecentCouponsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<Record<string, unknown>, Promise<Response>, Context> {
  constructor(private couponRepo: CouponRepoContract) {
    super();
  }

  @Authorize('coupons:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
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
