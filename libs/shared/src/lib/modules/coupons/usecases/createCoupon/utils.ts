import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { CouponStatus, CouponType } from '../../domain/Coupon';
import { CouponCode } from '../../domain/CouponCode';

import { CouponRepoContract } from '../../repos';

import {
  ExpirationDateRequiredError,
  InvalidInvoiceItemTypeError,
  InvalidExpirationDateError,
  DuplicateCouponCodeError,
  InvalidCouponStatusError,
  CouponCodeRequiredError,
  InvalidCouponCodeError,
  InvalidCouponTypeError,
} from './createCouponErrors';
import { CreateCouponDTO } from './createCouponDTO';

import { isExpirationDateValid } from '../utils';

type SanityCheckResult = Either<
  | ExpirationDateRequiredError
  | InvalidInvoiceItemTypeError
  | InvalidExpirationDateError
  | DuplicateCouponCodeError
  | InvalidCouponStatusError
  | CouponCodeRequiredError
  | InvalidCouponCodeError
  | InvalidCouponTypeError
  | UnexpectedError,
  CreateCouponDTO
>;

export function sanityChecksRequestParameters(couponRepo: CouponRepoContract) {
  return async (request: CreateCouponDTO): Promise<SanityCheckResult> => {
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

    const maybeIsCodeUsed = await couponRepo.isCodeUsed(code);

    if (maybeIsCodeUsed.isLeft()) {
      return left(
        new UnexpectedError(new Error(maybeIsCodeUsed.value.message))
      );
    }

    const isCodeUsed = maybeIsCodeUsed.value;

    if (code && isCodeUsed) {
      return left(new DuplicateCouponCodeError(code));
    }

    return right(request);
  };
}
