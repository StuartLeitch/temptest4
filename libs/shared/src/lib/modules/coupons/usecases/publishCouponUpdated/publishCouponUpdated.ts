import { SQSPublishServiceContract } from './../../../../domain/services/SQSPublishService';
import { UnexpectedError } from '../../../../../lib/core/logic/AppError';
import { Either, right, left } from '../../../../core/logic/Either';

export class PublishCouponUpdated {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(coupon: any): Promise<Either<UnexpectedError, void>> {
    const message = {
      event: 'CouponUpdated',
      data: {
        couponId: coupon.id,
        couponCode: coupon.name,
        percentage: coupon.reduction,
        dateUpdated: coupon.updated,
      },
    };

    try {
      await this.publishService.publishMessage(message);
      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err.toString()));
    }
  }
}
