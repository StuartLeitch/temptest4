import { SQSPublishServiceContract } from './../../../../domain/services/SQSPublishService';
import { UnexpectedError } from '../../../../../lib/core/logic/AppError';
import { Either, right, left } from '../../../../core/logic/Either';

export class PublishCouponCreated {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(coupon: any): Promise<Either<UnexpectedError, void>> {
    const message = {
      event: 'CouponCreated',
      data: {
        couponId: coupon.id,
        couponCode: coupon.name,
        percentage: coupon.reduction,
        dateCreated: coupon.created,
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
