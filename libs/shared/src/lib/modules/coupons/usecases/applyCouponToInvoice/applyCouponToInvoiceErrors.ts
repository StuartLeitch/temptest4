import { Result } from '../../../../core/logic/Result';
import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class CouponAlreadyUsedError extends Result<UseCaseError> {
  constructor(couponCode: string) {
    super(false, {
      message: `Coupon ${couponCode} has already been used.`,
    });
  }
}

export class CouponAlreadyUsedForInvoiceError extends Result<UseCaseError> {
  constructor(couponCode: string) {
    super(false, {
      message: `Coupon ${couponCode} has already been used for this invoice.`,
    });
  }
}

export class CouponExpiredError extends Result<UseCaseError> {
  constructor(couponCode: string) {
    super(false, {
      message: `Coupon ${couponCode} is expired.`,
    });
  }
}

export class InvoiceNotFoundError extends Result<UseCaseError> {
  constructor(invoiceId: string) {
    super(false, {
      message: `Couldn't find an invoice with code ${invoiceId}.`,
    });
  }
}

export class CouponNotFoundError extends Result<UseCaseError> {
  constructor(couponCode: string) {
    super(false, {
      message: `Couldn't find a coupon with code ${couponCode}.`,
    });
  }
}

export class CouponInvalidError extends Result<UseCaseError> {
  constructor(couponCode: string, invoiceId: string) {
    super(false, {
      message: `Coupon ${couponCode} can not be assigned to invoice ${invoiceId}.`,
    });
  }
}

export class CouponInactiveError extends Result<UseCaseError> {
  constructor(couponCode: string) {
    super(false, {
      message: `Coupon ${couponCode} is inactive.`,
    });
  }
}

export class InvoiceStatusInvalidError extends Result<UseCaseError> {
  constructor(couponCode: string, invoiceId: string) {
    super(false, {
      message: `Coupon ${couponCode} can not be assigned to invoice ${invoiceId}.`,
    });
  }
}

export class TransactionNotFoundError extends Result<UseCaseError> {
  constructor(invoiceId: string) {
    super(false, {
      message: `Couldn't find a Transaction for Invoice id {${invoiceId}}.`,
    });
  }
}

export class ManuscriptNotFoundError extends Result<UseCaseError> {
  constructor(manuscriptId: string) {
    super(false, {
      message: `Couldn't find a Manuscript with id {${manuscriptId}}.`,
    });
  }
}
