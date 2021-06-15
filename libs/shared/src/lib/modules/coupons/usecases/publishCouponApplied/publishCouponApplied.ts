import { SQSPublishServiceContract } from './../../../../domain/services/SQSPublishService';
import { UnexpectedError } from '../../../../../lib/core/logic/AppError';
import { Either, right, left } from '../../../../core/logic/Either';

export class PublishCouponApplied {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(coupon: any): Promise<Either<UnexpectedError, void>> {
    const message = {
      event: 'CouponApplied',
      data: {
        invoiceId: 'invoice-id',
        couponId: coupon.id,
        dateApplied: coupon.applied,
      },
    };

    try {
      await this.publishService.publishMessage(message);
      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
