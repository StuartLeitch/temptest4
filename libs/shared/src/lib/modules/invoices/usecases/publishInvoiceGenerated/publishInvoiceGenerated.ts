import {AppError} from '../../../../../lib/core/logic/AppError';
import {SQSPublishServiceContract} from './../../../../domain/services/SQSPublishService';
import {Invoice} from '../../domain/Invoice';
import {InvoiceMap} from './../../mappers/InvoiceMap';

export class PublishInvoiceGenerated {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(invoice: any): Promise<any> {
    const rawInvoice = InvoiceMap.toPersistence(invoice);

    const message = {
      event: 'InvoiceGenerated',
      data: {
        invoiceId: rawInvoice.id,
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
