import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvalidCouponType extends UseCaseError {
  constructor(type: string) {
    super(
      `The coupon type {${type}} is invalid, expected types are: 'SINGLE_USE' or 'MULTIPLE_USE'.`
    );
  }
}

export class InvalidCouponStatus extends UseCaseError {
  constructor(status: string) {
    super(
      `The coupon status {${status}} is invalid, expected statuses are: 'ACTIVE' or 'INACTIVE'`
    );
  }
}

export class InvalidExpirationDate extends UseCaseError {
  constructor(date: string) {
    super(
      `The provided expiration date {${date}} is in de past or improperly formatted.`
    );
  }
}

export class ExpirationDateRequired extends UseCaseError {
  constructor() {
    super(`Expiration date is required with MULTIPLE_USE Coupons.`);
  }
}

export class IdRequired extends UseCaseError {
  constructor() {
    super(`Id is required.`);
  }
}

export class CouldNotSaveCouponError extends UseCaseError {
  constructor(error: Error) {
    super(
      `The coupon could not be saved due to error ${error.message}, with stack ${error.stack}`
    );
  }
}

export class CouponNotFoundError extends UseCaseError {
  constructor(id: string) {
    super(`Coupon with id ${id} could not be found.`);
  }
}
