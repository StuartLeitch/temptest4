import { Either, right, left } from '../../../../core/logic/Either';

import { Coupon, CouponStatus, CouponType } from '../../domain/Coupon';

import { UpdateCouponDTO } from './updateCouponDTO';
import * as Errors from './updateCouponErrors';

import { isExpirationDateValid } from '../utils';

export interface UpdateCouponData {
  coupon: Coupon;
  request: UpdateCouponDTO;
}

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

export async function sanityChecksRequestParameters(
  request: UpdateCouponDTO
): Promise<
  Either<
    | Errors.ExpirationDateRequired
    | Errors.InvalidExpirationDate
    | Errors.InvalidCouponStatus
    | Errors.InvalidCouponType
    | Errors.IdRequired,
    UpdateCouponDTO
  >
> {
  const { type, status, expirationDate, id } = request;
  if (!id) {
    return left(new Errors.IdRequired());
  }
  if (type && !(type in CouponType)) {
    return left(new Errors.InvalidCouponType(type));
  }
  if (status && !(status in CouponStatus)) {
    return left(new Errors.InvalidCouponStatus(status));
  }
  if (type && type === CouponType.MULTIPLE_USE && !expirationDate) {
    return left(new Errors.ExpirationDateRequired());
  }
  if (
    type &&
    type === CouponType.MULTIPLE_USE &&
    !isExpirationDateValid(new Date(expirationDate), CouponType[type])
  ) {
    return left(new Errors.InvalidExpirationDate(expirationDate));
  }
  return right(request);
}
