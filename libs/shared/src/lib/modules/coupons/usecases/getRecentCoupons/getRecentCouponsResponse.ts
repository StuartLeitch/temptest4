import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Coupon } from '../../domain/Coupon';

export interface GetRecentCouponsSuccessResponse {
  totalCount: string | number;
  coupons: Coupon[];
}

export type GetRecentCouponsResponse = Either<
  UnexpectedError,
  GetRecentCouponsSuccessResponse
>;
