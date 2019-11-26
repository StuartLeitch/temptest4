import { AppError } from '../../../../core/logic/AppError';
import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';
import { Invoice } from '../../domain/Invoice';
import { InvoiceMap } from '../../mappers/InvoiceMap';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Payer } from '../../../payers/domain/Payer';
import { InvoiceItemMap } from '../../mappers/InvoiceItemMap';
import { PayerMap } from '../../../payers/mapper/Payer';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Payment } from '../../../payments/domain/Payment';
import { PaymentMap } from '../../../payments/mapper/Payment';
import { PaymentMethod } from '../../../payments/domain/PaymentMethod';

export class PublishInvoicePaid {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(
    invoice: Invoice,
    invoiceItems: InvoiceItem[],
    manuscript: Manuscript,
    payment: Payment,
    paymentMethod: PaymentMethod,
    payer: Payer
  ): Promise<any> {
    const message = {
      event: 'invoicePaid',
      data: {
        invoiceId: invoice.id.toString(),
        invoiceReference: invoice.invoiceNumber,
        invoiceIssueDate: invoice.dateCreated, // TODO change to accepted date
        invoiceItems: invoiceItems.map(InvoiceItemMap.toPersistence),
        payer: PayerMap.toPersistence(payer),
        manuscriptCustomId: manuscript.customId,
        paymentMethod: paymentMethod.name,
        paymentInfo: PaymentMap.toPersistence(payment)
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
