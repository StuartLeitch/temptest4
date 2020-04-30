import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../.././core/logic/AppError';
import { Coupon } from '../../domain/Coupon';

export interface GetRecentCouponsSuccessResponse {
  totalCount: string | number;
  coupons: Coupon[];
}

export type GetRecentCouponsResponse = Either<
  AppError.UnexpectedError,
  Result<GetRecentCouponsSuccessResponse>
>;
