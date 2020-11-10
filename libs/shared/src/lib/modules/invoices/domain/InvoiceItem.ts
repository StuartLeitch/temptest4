// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardArgument, Guard } from './../../../core/logic/Guard';
import { Result } from '../../../core/logic/Result';

import { Reduction } from '../../../domain/reductions/Reduction';

import { CouponAssignedCollection } from '../../coupons/domain/CouponAssignedCollection';
import { WaiverAssignedCollection } from '../../waivers/domain/WaiverAssignedCollection';
import { WaiverAssigned } from '../../waivers/domain/WaiverAssigned';
import { CouponAssigned } from '../../coupons/domain/CouponAssigned';
import { InvoiceItemId } from './InvoiceItemId';
import { ManuscriptId } from './ManuscriptId';
import { InvoiceId } from './InvoiceId';

export type InvoiceItemType = 'APC' | 'PRINT ORDER';

export interface InvoiceItemProps {
  invoiceId: InvoiceId;
  manuscriptId: ManuscriptId;
  type?: InvoiceItemType;
  vat?: number;
  price?: number;
  dateCreated: Date;
  name?: string;
  assignedCoupons?: CouponAssignedCollection;
  assignedWaivers?: WaiverAssignedCollection;
}

export class InvoiceItem extends AggregateRoot<InvoiceItemProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get invoiceItemId(): InvoiceItemId {
    return InvoiceItemId.create(this.id);
  }

  get invoiceId(): InvoiceId {
    return this.props.invoiceId;
  }

  get manuscriptId(): ManuscriptId {
    return this.props.manuscriptId;
  }

  get type(): InvoiceItemType {
    return this.props.type;
  }

  get price(): number {
    return this.props.price;
  }

  set price(priceValue: number) {
    this.props.price = priceValue;
  }

  get dateCreated(): Date {
    return this.props.dateCreated;
  }

  get name(): string {
    return this.props.name;
  }

  set vat(vat: number) {
    this.props.vat = vat;
  }

  get vat(): number {
    return this.props.vat || 0;
  }

  get assignedCoupons(): CouponAssignedCollection {
    return this.props.assignedCoupons;
  }

  get assignedWaivers(): WaiverAssignedCollection {
    return this.props.assignedWaivers;
  }

  public static create(
    props: InvoiceItemProps,
    id?: UniqueEntityID
  ): Result<InvoiceItem> {
    const guardArgs: GuardArgument[] = [
      { argument: props.invoiceId, argumentName: 'invoiceId' },
      { argument: props.manuscriptId, argumentName: 'manuscriptId' },
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardArgs);

    if (!guardResult.succeeded) {
      return Result.fail<InvoiceItem>(guardResult.message);
    }

    const defaultValues: InvoiceItemProps = {
      ...props,
      type: props.type ? props.type : 'APC',
      dateCreated: props.dateCreated ? props.dateCreated : new Date(),
      assignedCoupons:
        props.assignedCoupons ?? CouponAssignedCollection.create(),
      assignedWaivers:
        props.assignedWaivers ?? WaiverAssignedCollection.create(),
    };

    const invoiceItem = new InvoiceItem(defaultValues, id);
    return Result.ok<InvoiceItem>(invoiceItem);
  }

  private removeCouponIfExists(coupon: CouponAssigned): void {
    if (this.props.assignedCoupons.exists(coupon)) {
      this.props.assignedCoupons.remove(coupon);
    }
  }

  public addAssignedCoupon(coupon: CouponAssigned): void {
    this.removeCouponIfExists(coupon);
    this.props.assignedCoupons.add(coupon);
  }

  public addAssignedCoupons(
    coupons: CouponAssigned[] | CouponAssignedCollection
  ): void {
    coupons.forEach(this.addAssignedCoupon, this);
  }

  private removeWaiverIfExists(waiver: WaiverAssigned): void {
    if (this.props.assignedWaivers.exists(waiver)) {
      this.props.assignedWaivers.remove(waiver);
    }
  }

  public addAssignedWaiver(waiver: WaiverAssigned): void {
    this.removeWaiverIfExists(waiver);
    this.props.assignedWaivers.add(waiver);
  }

  public addAssignedWaivers(
    waivers: WaiverAssigned[] | WaiverAssignedCollection
  ): void {
    waivers.forEach(this.addAssignedWaiver, this);
  }

  private constructor(props: InvoiceItemProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public calculateNetPrice(withReductions?: Reduction<unknown>[]): number {
    return this.price - this.calculateDiscount(withReductions);
  }

  public calculateDiscount(withReductions?: Reduction<unknown>[]): number {
    const totalDiscount = this.calculateTotalDiscountPercentage(withReductions);

    if (totalDiscount >= 100) return this.price;

    return (totalDiscount * this.price) / 100;
  }

  public calculateVat(withReductions?: Reduction<unknown>[]): number {
    const net = this.calculateNetPrice(withReductions);

    return (this.vat * net) / 100;
  }

  public calculateTotalPrice(withReductions?: Reduction<unknown>[]): number {
    const net = this.calculateNetPrice(withReductions);

    return net + (net * this.vat) / 100;
  }

  public calculateTotalDiscountPercentage(
    withReductions?: Reduction<unknown>[]
  ): number {
    const reductions: Reduction<unknown>[] = [];
    if (this.assignedCoupons) {
      reductions.push(...this.assignedCoupons.coupons);
    }
    if (this.assignedWaivers) {
      reductions.push(...this.assignedWaivers.waivers);
    }
    if (withReductions) {
      reductions.push(...withReductions);
    }

    const totalDiscount = reductions.reduce(
      (acc, curr) => acc + curr.reduction,
      0
    );

    return totalDiscount >= 100 ? 100 : totalDiscount;
  }
}
