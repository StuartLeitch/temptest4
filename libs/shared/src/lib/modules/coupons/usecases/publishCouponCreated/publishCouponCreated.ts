import {CouponMap} from './../../mappers/CouponMap';
import {AppError} from '../../../../../lib/core/logic/AppError';
import {SQSPublishServiceContract} from './../../../../domain/services/SQSPublishService';

export class PublishCouponCreated {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(coupon: any): Promise<any> {
    const rawCoupon = CouponMap.toPersistence(coupon);

    const message = {
      event: 'CouponCreated',
      data: {
        couponId: coupon.id,
        couponCode: coupon.name,
        percentage: coupon.reduction,
        dateCreated: coupon.created
      }
    };

    try {
      await this.publishService.publishMessage(message);
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }
}
