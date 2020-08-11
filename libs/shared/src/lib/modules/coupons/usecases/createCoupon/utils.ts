import { left, right, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { CouponType, CouponStatus } from '../../domain/Coupon';
import { CouponCode } from '../../domain/CouponCode';

import { CouponRepoContract } from '../../repos';

import {
  ExpirationDateRequiredError,
  InvalidInvoiceItemTypeError,
  InvalidExpirationDateError,
  InvalidCouponCodeError,
  InvalidCouponTypeError,
  CouponCodeRequiredError,
  DuplicateCouponCodeError,
  InvalidCouponStatusError,
} from './createCouponErrors';
import { CreateCouponDTO } from './createCouponDTO';

import { isExpirationDateValid } from '../utils';

type SanityCheckResult = Either<
  | ExpirationDateRequiredError
  | InvalidInvoiceItemTypeError
  | InvalidExpirationDateError
  | DuplicateCouponCodeError
  | InvalidCouponStatusError
  | InvalidCouponCodeError
  | InvalidCouponTypeError
  | CouponCodeRequiredError
  | UnexpectedError,
  CreateCouponDTO
>;

export async function sanityChecksRequestParameters(
  request: CreateCouponDTO,
  couponRepo: CouponRepoContract
): Promise<SanityCheckResult> {
  const { invoiceItemType, expirationDate, type, status, code } = request;

  if (invoiceItemType !== 'APC' && invoiceItemType !== 'PRINT ORDER') {
    return left(new InvalidInvoiceItemTypeError(invoiceItemType));
  }

  if (!(type in CouponType)) {
    return left(new InvalidCouponTypeError(type));
  }

  if (!(status in CouponStatus)) {
    return left(new InvalidCouponStatusError(status));
  }

  if (!code) {
    return left(new CouponCodeRequiredError());
  }

  if (code && !CouponCode.isValid(code)) {
    return left(new InvalidCouponCodeError(code));
  }

  if (type && type === CouponType.MULTIPLE_USE && !expirationDate) {
    return left(new ExpirationDateRequiredError());
  }

  if (
    type === CouponType.MULTIPLE_USE &&
    !isExpirationDateValid(new Date(expirationDate), CouponType[type])
  ) {
    return left(new InvalidExpirationDateError(expirationDate));
  }

  if (code && (await couponRepo.isCodeUsed(code))) {
    return left(new DuplicateCouponCodeError(code));
  }

  return right(request);
}
