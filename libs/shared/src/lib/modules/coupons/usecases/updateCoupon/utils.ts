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
  | UpdateCouponErrors.ExpirationDateRequired
  | UpdateCouponErrors.InvalidExpirationDate
  | UpdateCouponErrors.InvalidCouponStatus
  | UpdateCouponErrors.InvalidCouponType
  | UpdateCouponErrors.IdRequired,
  UpdateCouponDTO
>;

export function updateCoupon({ coupon, request }: UpdateCouponData): Coupon {
  const { type, expirationDate, status, name, reduction } = request;
  if (type) {
    coupon.couponType = CouponType[type];
    if (type === CouponType.SINGLE_USE) {
      coupon.expirationDate = null;
    }
  }
  if (expirationDate) {
    coupon.expirationDate = new Date(expirationDate);
  }
  if (status) {
    coupon.status = CouponStatus[status];
  }

  if (name) {
    coupon.name = name;
  }

  if (reduction) {
    coupon.reduction = reduction;
  }

  const now = new Date();
  coupon.dateUpdated = now;

  return coupon;
}

export function sanityChecksRequestParameters(
  request: UpdateCouponDTO
): SanityCheckResponse {
  const { type, status, expirationDate, id } = request;
  if (!id) {
    return left(new UpdateCouponErrors.IdRequired());
  }
  if (type && !(type in CouponType)) {
    return left(new UpdateCouponErrors.InvalidCouponType(type));
  }
  if (status && !(status in CouponStatus)) {
    return left(new UpdateCouponErrors.InvalidCouponStatus(status));
  }
  if (type && type === CouponType.MULTIPLE_USE && !expirationDate) {
    return left(new UpdateCouponErrors.ExpirationDateRequired());
  }
  if (
    type &&
    type === CouponType.MULTIPLE_USE &&
    !isExpirationDateValid(new Date(expirationDate), CouponType[type])
  ) {
    return left(new UpdateCouponErrors.InvalidExpirationDate(expirationDate));
  }
  return right(request);
}
