// * Core Domain
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { Guard, GuardArgument } from './../../../core/logic/Guard';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';

import { InvoiceId } from './InvoiceId';
import { InvoiceItemId } from './InvoiceItemId';
import { ManuscriptId } from './ManuscriptId';
import { Coupon } from '../../coupons/domain/Coupon';
import { Coupons } from '../../coupons/domain/Coupons';
import { Reduction } from '../../../domain/reductions/Reduction';
import { Waiver } from '../../waivers/domain/Waiver';

export type InvoiceItemType = 'APC' | 'PRINT ORDER';

export interface InvoiceItemProps {
  invoiceId: InvoiceId;
  manuscriptId: ManuscriptId;
  type?: InvoiceItemType;
  vat?: number;
  price?: number;
  dateCreated: Date;
  name?: string;
  coupons?: Coupons;
  totalNumCoupons?: number;
  waivers?: Waiver[];
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
    return this.props.vat;
  }

  get coupons(): Coupons {
    return this.props.coupons;
  }

  get waivers(): Waiver[] {
    return this.props.waivers;
  }

  set waivers(waivers: Waiver[]) {
    this.props.waivers = waivers;
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
      coupons: props.coupons ? props.coupons : Coupons.create([]),
    };

    const invoiceItem = new InvoiceItem(defaultValues, id);
    return Result.ok<InvoiceItem>(invoiceItem);
  }

  private removeCouponIfExists(coupon: Coupon): void {
    if (this.props.coupons.exists(coupon)) {
      this.props.coupons.remove(coupon);
    }
  }

  public addCoupon(coupon: Coupon): Result<void> {
    this.removeCouponIfExists(coupon);
    this.props.coupons.add(coupon);
    this.props.totalNumCoupons++;
    // this.addDomainEvent(new InvoiceItemIssued(this, invoiceItem));
    return Result.ok<void>();
  }

  private constructor(props: InvoiceItemProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public calculatePrice(withReductions?: Reduction<unknown>[]) {
    const reductions: Reduction<unknown>[] = [];
    if (this.coupons) {
      reductions.push(...this.coupons.getItems());
    }
    if (this.waivers) {
      reductions.push(...this.waivers);
    }
    if (withReductions) {
      reductions.push(...withReductions);
    }

    const totalDiscount = reductions.reduce(
      (acc, curr) => acc + curr.reduction,
      0
    );

    if (totalDiscount >= 100) {
      return 0;
    }

    return this.price - (totalDiscount * this.price) / 100;
  }
}
