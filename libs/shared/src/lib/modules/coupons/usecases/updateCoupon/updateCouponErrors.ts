import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace UpdateCouponErrors {
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

  export class IdRequired extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Id is required.`
      });
    }
  }

  export class InvalidId extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `The provided id {${id}} does not exist.`
      });
    }
  }
}
