import { AppError } from '../../../../core/logic/AppError';
import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';
import { Invoice } from '../../domain/Invoice';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceItemMap } from '../../mappers/InvoiceItemMap';
import { PayerMap } from '../../../payers/mapper/Payer';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { PaymentMap } from '../../../payments/mapper/Payment';
import { InvoicePaymentInfo } from '../../domain/InvoicePaymentInfo';

export class PublishInvoicePaid {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(
    invoice: Invoice,
    invoiceItems: InvoiceItem[],
    manuscript: Manuscript,
    paymentDetails: InvoicePaymentInfo
  ): Promise<any> {
    const message = {
      event: 'invoicePaid',
      data: {
        invoiceId: invoice.id.toString(),
        invoiceItems: invoiceItems.map(InvoiceItemMap.toPersistence),
        manuscriptCustomId: manuscript.customId,
        transactionId: paymentDetails.transactionId,
        invoiceStatus: paymentDetails.invoiceStatus,
        invoiceNumber: paymentDetails.invoiceNumber,
        invoiceIssueDate: paymentDetails.invoiceIssueDate,
        payerEmail: paymentDetails.payerEmail,
        payerType: paymentDetails.payerType,
        address: `${paymentDetails.address}, ${paymentDetails.city}, ${paymentDetails.country}`,
        foreignPaymentId: paymentDetails.foreignPaymentId,
        amount: paymentDetails.amount,
        country: paymentDetails.country,
        paymentDate: paymentDetails.paymentDate,
        paymentType: paymentDetails.paymentType
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
