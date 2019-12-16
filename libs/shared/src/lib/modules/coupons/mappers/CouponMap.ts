import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';
import {Coupon, CouponType} from '../../../domain/reductions/Coupon';

export class CouponPersistenceDTO {
  id: string;
  reduction: number;
  type: string;
}

export class CouponMap extends Mapper<Coupon> {
  public static toDomain(raw: CouponPersistenceDTO): Coupon {
    const couponOrError = Coupon.create(
      {
        couponType: raw.type as CouponType,
        reduction: raw.reduction
      },
      new UniqueEntityID(raw.id)
    );

    return couponOrError.isSuccess ? couponOrError.getValue() : null;
  }

  public static toPersistence(coupon: Coupon): CouponPersistenceDTO {
    return {
      id: coupon.id.toString(),
      reduction: coupon.reduction,
      type: coupon.couponType
    };
  }
}
