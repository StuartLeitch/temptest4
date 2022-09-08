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

import { DeleteBulkCouponsResponse as Response } from './deleteBulkCouponsResponse';
import type { DeleteBulkCouponsDTO as DTO } from './deleteBulkCouponsDTO';

export class DeleteBulkCouponsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(private couponRepo: CouponRepoContract) {
    super();
  }

  @Authorize('coupons:bulkDelete')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const maybeBulkDelete = await this.couponRepo.bulkDelete(
        request.couponCodes
      );

      if (maybeBulkDelete.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeBulkDelete.value.message))
        );
      }

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err, 'Deleting coupons failed.'));
    }
  }
}
