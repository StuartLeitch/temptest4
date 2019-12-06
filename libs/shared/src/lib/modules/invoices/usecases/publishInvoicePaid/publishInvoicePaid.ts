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
      event: 'InvoicePaid',
      data: {
        invoiceId: invoice.id.toString(),
        invoiceItems: invoiceItems.map(ii => ({
          id: ii.id.toString(),
          manuscriptCustomId: manuscript.customId,
          manuscriptId: ii.manuscriptId.id.toString(),
          type: ii.type,
          price: ii.price,
          vatPercentage: ii.vat,
        })),
        transactionId: paymentDetails.transactionId,
        invoiceStatus: paymentDetails.invoiceStatus,
        referenceNumber: `${invoice.invoiceNumber}/${invoice.dateAccepted.getFullYear()}`,
        invoiceIssueDate: paymentDetails.invoiceIssueDate,
        payerName: paymentDetails.payerName,
        payerEmail: paymentDetails.payerEmail,
        payerType: paymentDetails.payerType,
        vatRegistrationNumber: paymentDetails.vatRegistrationNumber,
        address: `${paymentDetails.address}, ${paymentDetails.city}, ${paymentDetails.country}`,
        foreignPaymentId: paymentDetails.foreignPaymentId,
        country: paymentDetails.country,
        paymentDate: paymentDetails.paymentDate,
        paymentType: paymentDetails.paymentType,
        paymentAmount: paymentDetails.amount,
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
