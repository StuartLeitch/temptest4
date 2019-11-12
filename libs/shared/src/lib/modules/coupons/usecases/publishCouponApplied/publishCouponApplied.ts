import {CouponMap} from './../../mappers/CouponMap';
import {AppError} from '../../../../../lib/core/logic/AppError';
import {SQSPublishServiceContract} from './../../../../domain/services/SQSPublishService';

export class PublishCouponApplied {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(coupon: any): Promise<any> {
    const rawCoupon = CouponMap.toPersistence(coupon);

    const message = {
      event: 'CouponApplied',
      data: {
        invoiceId: 'invoice-id',
        couponId: coupon.id,
        dateApplied: coupon.applied
      }
    };

    try {
      await this.publishService.publishMessage(message);
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }
}
