import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, flatten } from '../../../core/logic/Either';
import { Mapper } from '../../../infrastructure/Mapper';

import { CouponAssignedProps, CouponAssigned } from '../domain/CouponAssigned';
import { CouponAssignedCollection } from '../domain/CouponAssignedCollection';
import { InvoiceItemId } from '../../invoices/domain/InvoiceItemId';
import { Coupon, CouponType } from '../domain/Coupon';
import { CouponCode } from '../domain/CouponCode';

export class CouponPersistenceDTO {
  id: string;
  reduction: number;
  name: string;
  type: string;
  code: string;
  dateCreated: Date;
  dateUpdated: Date;
  expirationDate?: Date;
  invoiceItemType: string;
  redeemCount: number;
  status: string;
}

export class CouponMap extends Mapper<Coupon> {
  public static toDomain(
    raw: CouponPersistenceDTO
  ): Either<GuardFailure, Coupon> {
    const maybeCode = CouponCode.create(raw.code);

    if (maybeCode.isLeft()) {
      return null;
    }

    const couponOrError = Coupon.create(
      {
        couponType: raw.type as CouponType,
        reduction: raw.reduction,
        code: maybeCode.value,
        dateCreated: raw.dateCreated ? new Date(raw.dateCreated) : null,
        dateUpdated: raw.dateUpdated ? new Date(raw.dateUpdated) : null,
        expirationDate: raw.expirationDate
          ? new Date(raw.expirationDate)
          : null,
        invoiceItemType: raw.invoiceItemType as any,
        redeemCount: raw.redeemCount,
        status: raw.status as any,
        name: raw.name,
      },
      new UniqueEntityID(raw.id)
    );

    return couponOrError;
  }

  public static toDomainCollection(
    raw: any[]
  ): Either<GuardFailure, CouponAssignedCollection> {
    const createItemId = (id: string) =>
      InvoiceItemId.create(new UniqueEntityID(id));
    const createPayload = (item: any) => (coupon: Coupon) => ({
      invoiceItemId: createItemId(item.invoiceItemId),
      dateAssigned: new Date(item.dateAssigned),
      coupon,
    });

    const maybeRawDataList = raw.map((item) =>
      CouponMap.toDomain(item).map(createPayload(item))
    );

    return flatten(maybeRawDataList)
      .map((items) => items.map(CouponAssigned.create))
      .map(CouponAssignedCollection.create);
  }

  public static toPersistence(coupon: Coupon): CouponPersistenceDTO {
    return {
      id: coupon.id.toString(),
      reduction: coupon.reduction,
      type: coupon.couponType,
      code: coupon.code.value,
      dateCreated: coupon.dateCreated,
      dateUpdated: coupon.dateUpdated,
      expirationDate: coupon.expirationDate,
      invoiceItemType: coupon.invoiceItemType,
      redeemCount: coupon.redeemCount,
      status: coupon.status,
      name: coupon.name,
    };
  }

  public static toEvent(coupon: Coupon): any {
    return {
      id: coupon.id.toString(),
      reduction: coupon.reduction,
      type: coupon.couponType,
      code: coupon.code.value,
      dateCreated: coupon.dateCreated,
      dateUpdated: coupon.dateUpdated,
      expirationDate: coupon.expirationDate,
      invoiceItemType: coupon.invoiceItemType,
      name: coupon.name,
    };
  }
}
