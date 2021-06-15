import { createHash, randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { Either, right, left } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { ValueObject } from '../../../core/domain/ValueObject';

interface CouponCodeProps {
  value: string;
}

export class CouponCode extends ValueObject<CouponCodeProps> {
  static readonly MAX_COUPON_CODE_LENGTH = 10;
  static readonly MIN_COUPON_CODE_LENGTH = 6;
  static readonly SALT_SIZE = 256;

  static get MAX_NUMBER_OF_CODES(): number {
    return Array(
      CouponCode.MAX_COUPON_CODE_LENGTH - CouponCode.MIN_COUPON_CODE_LENGTH
    )
      .fill(0)
      .map((v, i) => i + CouponCode.MIN_COUPON_CODE_LENGTH)
      .reduce((acc, v) => acc * v, 1);
  }

  public static create(value: string): Either<GuardFailure, CouponCode> {
    if (!CouponCode.isValid(value)) {
      return left(new GuardFailure('Must provide a valid coupon code'));
    }
    return right(new CouponCode({ value }));
  }

  public static isValid(code: string | CouponCode): boolean {
    const validCodeRegex = /^([A-Z0-9]{6,10})$/;
    let rawCode: string;

    if (code instanceof CouponCode) {
      rawCode = code.value;
    } else {
      rawCode = code;
    }

    if (rawCode && rawCode.match(validCodeRegex)) {
      return true;
    }

    return false;
  }

  static getRandomCouponCodeLength(): number {
    const range =
      CouponCode.MAX_COUPON_CODE_LENGTH - CouponCode.MIN_COUPON_CODE_LENGTH;
    return Math.floor(
      Math.random() * range + CouponCode.MIN_COUPON_CODE_LENGTH
    );
  }

  static generateCouponCode(): Either<GuardFailure, CouponCode> {
    const salt = randomBytes(CouponCode.SALT_SIZE);
    const hash = createHash('sha256');

    hash.update(salt);
    hash.update(uuidv4());

    const rawCode = hash
      .digest('base64')
      .toUpperCase()
      .replace('/', '')
      .replace('+', '')
      .slice(0, CouponCode.getRandomCouponCodeLength());
    return CouponCode.create(rawCode);
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }

  private constructor(props: CouponCodeProps) {
    super(props);
  }
}
