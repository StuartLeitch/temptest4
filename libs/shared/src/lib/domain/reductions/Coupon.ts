// * Core Domain
import { Result } from '../../core/logic/Result';
import { UniqueEntityID } from '../../core/domain/UniqueEntityID';

import { ReductionProps, Reduction, ReductionType } from './Reduction';
import { CouponId } from './CouponId';
import { CouponCode } from './CouponCode';
import { InvoiceItemType } from '@hindawi/phenom-events/src/lib/invoiceItem';

// * Coupon Domain Events
import { CouponCreated } from './../../modules/coupons/domain/events/couponCreated';

export enum CouponType {
  SINGLE_USE = 'SINGLE_USE',
  MULTIPLE_USE = 'MULTIPLE_USE'
}

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface CouponProps extends ReductionProps {
  couponType: CouponType;
  code: CouponCode;
  expirationDate?: Date;
  status: CouponStatus;
  redeemCount: number;
  invoiceItemType: InvoiceItemType;
  dateCreated: Date;
  dateUpdated: Date;
  name: string;
}

export class Coupon extends Reduction<CouponProps> {
  private constructor(props: CouponProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public get couponId(): CouponId {
    return CouponId.create(this._id).getValue();
  }

  public get reductionType(): ReductionType {
    return ReductionType.COUPON;
  }

  public get reduction(): number {
    return this.props.reduction;
  }

  public get couponType(): CouponType {
    return this.props.couponType;
  }

  public get code(): CouponCode {
    return this.props.code;
  }

  public set code(newCode: CouponCode) {
    this.props.code = newCode;
  }

  public get expirationDate(): Date {
    return this.props.expirationDate;
  }

  public get status(): CouponStatus {
    return this.props.status;
  }

  public get redeemCount(): number {
    return this.props.redeemCount;
  }

  public get invoiceItemType(): InvoiceItemType {
    return this.props.invoiceItemType;
  }

  public get dateCreated(): Date {
    return this.props.dateCreated;
  }

  public get dateUpdated(): Date {
    return this.props.dateUpdated;
  }

  public get name(): string {
    return this.props.name;
  }

  public static create(
    props: CouponProps,
    id?: UniqueEntityID
  ): Result<Coupon> {
    const coupon = new Coupon(props, id);

    return Result.ok<Coupon>(coupon);
  }
}
