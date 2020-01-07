import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace CreateCouponErrors {
  export class InvalidCouponType extends Result<UseCaseError> {
    constructor(type: string) {
      super(false, {
        message: `The coupon type {${type}} is invalid, expected types are: 'SINGLE_USE' or 'MULTIPLE_USE'.`
      });
    }
  }

  export class InvalidCouponStatus extends Result<UseCaseError> {
    constructor(status: string) {
      super(false, {
        message: `The coupon status {${status}} is invalid, expected statuses are: 'ACTIVE' or 'INACTIVE'`
      });
    }
  }

  export class DuplicateCouponCode extends Result<UseCaseError> {
    constructor(code: string) {
      super(false, {
        message: `The code {${code}} is already in use.`
      });
    }
  }

  export class InvalidCouponCode extends Result<UseCaseError> {
    constructor(code: string) {
      super(false, {
        message: `The provided coupon code {${code}} is invalid, it needs to have between 2 and 10 alpha-numeric characters`
      });
    }
  }

  export class InvalidExpirationDate extends Result<UseCaseError> {
    constructor(date: string) {
      super(false, {
        message: `The provided expiration date {${date}} is in de past or improperly formated.`
      });
    }
  }

  export class ExpirationDateRequired extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Expiration date is required with MULTIPLE_USE Coupons.`
      });
    }
  }

  export class InvalidInvoiceItemType extends Result<UseCaseError> {
    constructor(invoiceItemType: string) {
      super(false, {
        message: `The provided invoice item type {${invoiceItemType}} is invalid, expected types are: 'APC' or 'PRINT ORDER'`
      });
    }
  }
}
