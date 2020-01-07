import { left, right, Either } from '../../../../core/logic/Result';

import { Coupon, CouponStatus, CouponType } from '../../domain/Coupon';

import { UpdateCouponErrors } from './updateCouponErrors';
import { UpdateCouponDTO } from './updateCouponDTO';

import { isExpirationDateValid } from '../utils';

export interface UpdateCouponData {
  coupon: Coupon;
  request: UpdateCouponDTO;
}

type SanityCheckResponse = Either<
  | UpdateCouponErrors.InvalidExpirationDate
  | UpdateCouponErrors.InvalidCouponStatus
  | UpdateCouponErrors.InvalidCouponType
  | UpdateCouponErrors.IdRequired,
  UpdateCouponDTO
>;

export function updateCoupon({ coupon, request }: UpdateCouponData): Coupon {
  const { couponType, expirationDate, status } = request;
  if (couponType) {
    coupon.couponType = CouponType[couponType];
    if (couponType === CouponType.SINGLE_USE) {
      coupon.expirationDate = null;
    }
  }
  if (expirationDate) {
    coupon.expirationDate = new Date(expirationDate);
  }
  if (status) {
    coupon.status = CouponStatus[status];
  }
  return coupon;
}

export function sanityChecksRequestParameters(
  request: UpdateCouponDTO
): SanityCheckResponse {
  const { couponType, status, expirationDate, id } = request;
  if (!id) {
    return left(new UpdateCouponErrors.IdRequired());
  }
  if (!!couponType && !(couponType in CouponType)) {
    return left(new UpdateCouponErrors.InvalidCouponType(couponType));
  }
  if (!!status && !(status in CouponStatus)) {
    return left(new UpdateCouponErrors.InvalidCouponStatus(status));
  }
  if (
    !!couponType &&
    couponType === CouponType.MULTIPLE_USE &&
    !isExpirationDateValid(new Date(expirationDate), CouponType[couponType])
  ) {
    return left(new UpdateCouponErrors.InvalidExpirationDate(expirationDate));
  }
  return right(request);
}
