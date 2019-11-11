import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';
import {Coupon} from '../../../domain/reductions/Coupon';

export class CouponPersistenceDTO {
  id: string;
  name: string;
  valid: boolean;
  reduction: number;
  created?: Date;
}

export class CouponMap extends Mapper<Coupon> {
  public static toDomain(raw: CouponPersistenceDTO): Coupon {
    const couponOrError = Coupon.create(
      {
        // couponId: CouponId.create(new UniqueEntityID(raw.articleId)),
        // amount: Amount.create(raw.amount).getValue(),
        name: raw.name,
        isValid: raw.valid,
        reduction: raw.reduction,
        created: new Date(raw.created)
      },
      new UniqueEntityID(raw.id)
    );

    return couponOrError.isSuccess ? couponOrError.getValue() : null;
  }

  public static toPersistence(coupon: Coupon): CouponPersistenceDTO {
    return {
      id: coupon.id.toString(),
      // articleId: transaction.articleId.toString(),
      name: coupon.name,
      valid: coupon.isValid,
      reduction: coupon.reduction,
      created: coupon.created
    };
  }
}
