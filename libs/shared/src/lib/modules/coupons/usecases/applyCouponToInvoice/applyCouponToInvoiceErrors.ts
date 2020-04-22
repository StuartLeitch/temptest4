import { Result } from 'libs/shared/src/lib/core/logic/Result';
import { UseCaseError } from 'libs/shared/src/lib/core/logic/UseCaseError';

export namespace ApplyCouponToInvoiceErrors {
  export class CouponAlreadyUsedError extends Result<UseCaseError> {
    constructor(couponCode: string) {
      super(false, {
        message: `Coupon ${couponCode} has already been used.`
      });
    }
  }
  export class CouponExpiredError extends Result<UseCaseError> {
    constructor(couponCode: string) {
      super(false, {
        message: `Coupon ${couponCode} is expired.`
      });
    }
  }

  export class InvoiceNotFoundError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `Couldn't find an invoice with code ${invoiceId}.`
      });
    }
  }

  export class CouponNotFoundError extends Result<UseCaseError> {
    constructor(couponCode: string) {
      super(false, {
        message: `Couldn't find a coupon with code ${couponCode}.`
      });
    }
  }

  export class CouponInvalidError extends Result<UseCaseError> {
    constructor(couponCode: string, invoiceId: string) {
      super(false, {
        message: `Coupon ${couponCode} can not be assigned to invoice ${invoiceId}.`
      });
    }
  }

  export class InvoiceStatusInvalidError extends Result<UseCaseError> {
    constructor(couponCode: string, invoiceId: string) {
      super(false, {
        message: `Coupon ${couponCode} can not be assigned to invoice ${invoiceId}.`
      });
    }
  }
}
