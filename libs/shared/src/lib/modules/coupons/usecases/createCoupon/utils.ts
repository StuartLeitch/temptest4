import { left, right, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { CouponType, CouponStatus } from '../../domain/Coupon';
import { CouponCode } from '../../domain/CouponCode';

import { CouponRepoContract } from '../../repos';

import { CreateCouponErrors } from './createCouponErrors';
import { CreateCouponDTO } from './createCouponDTO';

import { isExpirationDateValid } from '../utils';

type SanityCheckResult = Either<
  | CreateCouponErrors.InvalidInvoiceItemType
  | CreateCouponErrors.InvalidExpirationDate
  | CreateCouponErrors.DuplicateCouponCode
  | CreateCouponErrors.InvalidCouponStatus
  | CreateCouponErrors.InvalidCouponCode
  | CreateCouponErrors.InvalidCouponType
  | AppError.UnexpectedError,
  CreateCouponDTO
>;

export async function sanityChecksRequestParameters(
  request: CreateCouponDTO,
  couponRepo: CouponRepoContract
): Promise<SanityCheckResult> {
  const { invoiceItemType, expirationDate, couponType, status, code } = request;
  if (invoiceItemType !== 'APC' && invoiceItemType !== 'PRINT ORDER') {
    return left(new CreateCouponErrors.InvalidInvoiceItemType(invoiceItemType));
  }
  if (!(couponType in CouponType)) {
    return left(new CreateCouponErrors.InvalidCouponType(couponType));
  }
  if (!(status in CouponStatus)) {
    return left(new CreateCouponErrors.InvalidCouponStatus(status));
  }
  if (code && !CouponCode.isValid(code)) {
    return left(new CreateCouponErrors.InvalidCouponCode(code));
  }
  if (
    couponType === CouponType.MULTIPLE_USE &&
    !isExpirationDateValid(new Date(expirationDate), CouponType[couponType])
  ) {
    return left(new CreateCouponErrors.InvalidExpirationDate(expirationDate));
  }
  if (code && (await couponRepo.isCodeUsed(code))) {
    return left(new CreateCouponErrors.DuplicateCouponCode(code));
  }

  return right(request);
}
