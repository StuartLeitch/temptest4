import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvalidCouponTypeError extends UseCaseError {
  constructor(type: string) {
    super(
      `The coupon type {${type}} is invalid, expected types are: 'SINGLE_USE' or 'MULTIPLE_USE'.`
    );
  }
}

export class InvalidCouponStatusError extends UseCaseError {
  constructor(status: string) {
    super(
      `The coupon status {${status}} is invalid, expected statuses are: 'ACTIVE' or 'INACTIVE'`
    );
  }
}

export class DuplicateCouponCodeError extends UseCaseError {
  constructor(code: string) {
    super(`The code {${code}} is already in use.`);
  }
}

export class CouponCodeRequiredError extends UseCaseError {
  constructor() {
    super(`Coupon code is required.`);
  }
}

export class InvalidCouponCodeError extends UseCaseError {
  constructor(code: string) {
    super(
      `The provided coupon code {${code}} is invalid, it needs to have between 2 and 10 alpha-numeric characters`
    );
  }
}

export class InvalidExpirationDateError extends UseCaseError {
  constructor(date: string) {
    super(
      `The provided expiration date {${date}} is in de past or improperly formatted.`
    );
  }
}

export class ExpirationDateRequiredError extends UseCaseError {
  constructor() {
    super(`Expiration date is required with MULTIPLE_USE Coupons.`);
  }
}

export class InvalidInvoiceItemTypeError extends UseCaseError {
  constructor(invoiceItemType: string) {
    super(
      `The provided invoice item type {${invoiceItemType}} is invalid, expected types are: 'APC' or 'PRINT ORDER'`
    );
  }
}

export class CouponNotSavedError extends UseCaseError {
  constructor(err: Error) {
    super(
      `The coupon could not be saved due to error: ${err.message}, with stack trace: ${err.stack}`
    );
  }
}
