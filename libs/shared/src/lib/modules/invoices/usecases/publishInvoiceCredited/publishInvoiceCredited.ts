import { InvoiceStatus as PhenomInvoiceStatus } from '@hindawi/phenom-events/src/lib/invoice';
// import { InvoiceConfirmed as InvoiceConfirmedEvent } from '@hindawi/phenom-events';

import { AppError } from '../../../../core/logic/AppError';
import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';
import { Invoice } from '../../domain/Invoice';
// import { InvoiceItem } from '../../domain/InvoiceItem';
// import { Payer } from '../../../payers/domain/Payer';
// import { Manuscript } from '../../../manuscripts/domain/Manuscript';
// import { Address } from '../../../addresses/domain/Address';
import { EventUtils } from 'libs/shared/src/lib/utils/EventUtils';
// import { CouponMap } from '../../../coupons/mappers/CouponMap';
// import { WaiverMap } from '../../../waivers/mappers/WaiverMap';

const INVOICE_CREDITED = 'InvoiceCredited';

export class PublishInvoiceCredited {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(
    invoice: Invoice,
    messageTimestamp?: Date
  ): Promise<any> {
    // const data: InvoiceConfirmedEvent
    const data = {
      ...EventUtils.createEventObject(),
      invoiceId: invoice.id.toString()
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: INVOICE_CREDITED,
        data
      });
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }
}
