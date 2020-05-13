// * Core Domain
import { Result } from '../../../core/logic/Result';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

import { InvoiceItemType } from '../../invoices/domain/InvoiceItem';
import { CouponCode } from './CouponCode';
import { CouponId } from './CouponId';
import {
  ReductionProps,
  ReductionType,
  Reduction,
} from '../../../domain/reductions/Reduction';

export enum CouponType {
  SINGLE_USE = 'SINGLE_USE',
  MULTIPLE_USE = 'MULTIPLE_USE',
}

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
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

export type CouponCollection = Coupon[];

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

  public set reduction(newValue: number) {
    this.props.reduction = newValue;
  }

  public get couponType(): CouponType {
    return this.props.couponType;
  }

  public set couponType(newType: CouponType) {
    this.props.couponType = newType;
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

  public set expirationDate(newDate: Date) {
    this.props.expirationDate = newDate;
  }

  public get status(): CouponStatus {
    return this.props.status;
  }

  public set status(newStatus: CouponStatus) {
    this.props.status = newStatus;
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

  public set dateUpdated(newDate: Date) {
    this.props.dateUpdated = newDate;
  }

  public get name(): string {
    return this.props.name;
  }

  public set name(newName: string) {
    this.props.name = newName;
  }

  public static create(
    props: CouponProps,
    id?: UniqueEntityID
  ): Result<Coupon> {
    const coupon = new Coupon(props, id);

    return Result.ok<Coupon>(coupon);
  }
}
