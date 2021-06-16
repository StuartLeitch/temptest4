import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class CouponAlreadyUsedError extends UseCaseError {
  constructor(couponCode: string) {
    super(`Coupon ${couponCode} has already been used.`);
  }
}

export class CouponAlreadyUsedForInvoiceError extends UseCaseError {
  constructor(couponCode: string) {
    super(`Coupon ${couponCode} has already been used for this invoice.`);
  }
}

export class CouponExpiredError extends UseCaseError {
  constructor(couponCode: string) {
    super(`Coupon ${couponCode} is expired.`);
  }
}

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find an invoice with id ${invoiceId}.`);
  }
}

export class InvoiceItemsNotFoundError extends UseCaseError {
  constructor(invoiceId: string, err: Error) {
    super(
      `Couldn't find the invoice items for invoice with id ${invoiceId}, got error: ${err.message}, with stack ${err.stack}.`
    );
  }
}

export class CouponNotFoundError extends UseCaseError {
  constructor(couponCode: string) {
    super(`Couldn't find a coupon with code ${couponCode}.`);
  }
}

export class CouponInvalidError extends UseCaseError {
  constructor(couponCode: string, invoiceId: string) {
    super(`Coupon ${couponCode} can not be assigned to invoice ${invoiceId}.`);
  }
}

export class CouponInactiveError extends UseCaseError {
  constructor(couponCode: string) {
    super(`Coupon ${couponCode} is inactive.`);
  }
}

export class InvoiceStatusInvalidError extends UseCaseError {
  constructor(couponCode: string, invoiceReferenceNumber: string) {
    super(
      `Coupon ${couponCode} can not be assigned to invoice ${invoiceReferenceNumber} as it is already confirmed, please refresh the page.`
    );
  }
}

export class TransactionNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find a Transaction for Invoice id {${invoiceId}}.`);
  }
}

export class ManuscriptNotFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(`Couldn't find a Manuscript with id {${manuscriptId}}.`);
  }
}

export class InvoiceConfirmationFailed extends UseCaseError {
  constructor(message: string) {
    super(message);
  }
}
