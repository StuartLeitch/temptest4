import { AppError } from '../../../../core/logic/AppError';
import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';
import { Invoice } from '../../domain/Invoice';
import { InvoiceMap } from '../../mappers/InvoiceMap';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Payer } from '../../../payers/domain/Payer';
import { InvoiceItemMap } from '../../mappers/InvoiceItemMap';
import { PayerMap } from '../../../payers/mapper/Payer';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';

export class PublishInvoiceConfirmed {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(
    invoice: Invoice,
    invoiceItems: InvoiceItem[],
    manuscript: Manuscript,
    payer: Payer
  ): Promise<any> {
    const message = {
      event: 'invoiceConfirmed',
      data: {
        invoiceId: invoice.id.toString(),
        invoiceReference: invoice.invoiceNumber,
        invoiceIssueDate: invoice.dateCreated, // TODO change to accepted date
        invoiceItems: invoiceItems.map(InvoiceItemMap.toPersistence),
        payer: PayerMap.toPersistence(payer),
        manuscriptCustomId: manuscript.customId
        // VAT: "todo"
        // couponId: coupon.id,
        // dateApplied: coupon.applied
      }
    };

    try {
      await this.publishService.publishMessage(message);
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }
}
