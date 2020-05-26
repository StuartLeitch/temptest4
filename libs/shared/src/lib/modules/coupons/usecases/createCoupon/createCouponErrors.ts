import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export class InvalidCouponTypeError extends Result<UseCaseError> {
  constructor(type: string) {
    super(false, {
      message: `The coupon type {${type}} is invalid, expected types are: 'SINGLE_USE' or 'MULTIPLE_USE'.`,
    });
  }
}

export class InvalidCouponStatusError extends Result<UseCaseError> {
  constructor(status: string) {
    super(false, {
      message: `The coupon status {${status}} is invalid, expected statuses are: 'ACTIVE' or 'INACTIVE'`,
    });
  }
}

export class DuplicateCouponCodeError extends Result<UseCaseError> {
  constructor(code: string) {
    super(false, {
      message: `The code {${code}} is already in use.`,
    });
  }
}

export class CouponCodeRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Coupon code is required.`,
    });
  }
}

export class InvalidCouponCodeError extends Result<UseCaseError> {
  constructor(code: string) {
    super(false, {
      message: `The provided coupon code {${code}} is invalid, it needs to have between 2 and 10 alpha-numeric characters`,
    });
  }
}

export class InvalidExpirationDateError extends Result<UseCaseError> {
  constructor(date: string) {
    super(false, {
      message: `The provided expiration date {${date}} is in de past or improperly formated.`,
    });
  }
}

export class ExpirationDateRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Expiration date is required with MULTIPLE_USE Coupons.`,
    });
  }
}

export class InvalidInvoiceItemTypeError extends Result<UseCaseError> {
  constructor(invoiceItemType: string) {
    super(false, {
      message: `The provided invoice item type {${invoiceItemType}} is invalid, expected types are: 'APC' or 'PRINT ORDER'`,
    });
  }
}
