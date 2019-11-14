import {CouponMap} from './../../mappers/CouponMap';
import {AppError} from '../../../../../lib/core/logic/AppError';
import {SQSPublishServiceContract} from './../../../../domain/services/SQSPublishService';

export class PublishCouponUpdated {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(coupon: any): Promise<any> {
    const rawCoupon = CouponMap.toPersistence(coupon);

    const message = {
      event: 'CouponUpdated',
      data: {
        couponId: coupon.id,
        couponCode: coupon.name,
        percentage: coupon.reduction,
        dateUpdated: coupon.updated
      }
    };

    try {
      await this.publishService.publishMessage(message);
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }
}
