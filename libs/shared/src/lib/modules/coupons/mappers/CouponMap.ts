import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
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
  public static toDomain(raw: CouponPersistenceDTO): Coupon {
    const couponOrError = Coupon.create(
      {
        couponType: raw.type as CouponType,
        reduction: raw.reduction,
        code: CouponCode.create(raw.code).getValue(),
        dateCreated: raw.dateCreated ? new Date(raw.dateCreated) : null,
        dateUpdated: raw.dateUpdated ? new Date(raw.dateUpdated) : null,
        expirationDate: raw.expirationDate
          ? new Date(raw.expirationDate)
          : null,
        invoiceItemType: raw.invoiceItemType as any,
        redeemCount: raw.redeemCount,
        status: raw.status as any,
        name: raw.name
      },
      new UniqueEntityID(raw.id)
    );

    return couponOrError.isSuccess ? couponOrError.getValue() : null;
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
      name: coupon.name
    };
  }
}
